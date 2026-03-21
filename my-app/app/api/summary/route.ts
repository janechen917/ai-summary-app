export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import getSupabaseAdmin from '../../../lib/supabaseAdmin';

// 延迟初始化 OpenAI 客户端，避免构建时错误
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GITHUB_TOKEN || '';
  const baseURL = process.env.OPENAI_API_BASE || 'https://models.inference.ai.azure.com';

  return new OpenAI({
    apiKey,
    baseURL,
  });
}

const SINGLE_PASS_CHAR_LIMIT = 6000;
const CHUNK_CHAR_LIMIT = 4500;
const CHUNK_SUMMARY_MAX_TOKENS = 380;
const FINAL_SUMMARY_MAX_TOKENS = 800;
const MERGE_BATCH_SIZE = 8;

type SummaryResult = {
  summary: string;
  usedChunking: boolean;
  chunkCount: number;
  mergeRounds: number;
};

function splitTextIntoChunks(text: string, maxChars: number): string[] {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = '';
    }

    if (paragraph.length <= maxChars) {
      current = paragraph;
      continue;
    }

    for (let i = 0; i < paragraph.length; i += maxChars) {
      chunks.push(paragraph.slice(i, i + maxChars));
    }
  }

  if (current) {
    chunks.push(current);
  }

  if (chunks.length === 0) {
    return [text.slice(0, maxChars)];
  }

  return chunks;
}

function groupBySize<T>(arr: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    groups.push(arr.slice(i, i + size));
  }
  return groups;
}

async function summarizeOnce(
  openai: OpenAI,
  model: string,
  userContent: string,
  maxTokens: number
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: '你是一个专业的文档摘要助手。请输出简洁、准确、结构化的中文摘要，突出重点信息。',
      },
      {
        role: 'user',
        content: userContent,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content || '无法生成摘要';
}

async function summarizeWithChunking(
  openai: OpenAI,
  model: string,
  text: string
): Promise<SummaryResult> {
  if (text.length <= SINGLE_PASS_CHAR_LIMIT) {
    const summary = await summarizeOnce(
      openai,
      model,
      `请为以下文档生成摘要：\n\n${text}`,
      FINAL_SUMMARY_MAX_TOKENS
    );

    return {
      summary,
      usedChunking: false,
      chunkCount: 1,
      mergeRounds: 0,
    };
  }

  const chunks = splitTextIntoChunks(text, CHUNK_CHAR_LIMIT);
  const chunkSummaries: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkSummary = await summarizeOnce(
      openai,
      model,
      `你正在处理长文分块摘要任务。\n\n这是第 ${i + 1}/${chunks.length} 块，请总结关键事实、结论与上下文：\n\n${chunk}`,
      CHUNK_SUMMARY_MAX_TOKENS
    );
    chunkSummaries.push(chunkSummary);
  }

  let currentLayer = chunkSummaries;
  let mergeRounds = 0;

  while (currentLayer.length > 1) {
    mergeRounds += 1;
    const groups = groupBySize(currentLayer, MERGE_BATCH_SIZE);
    const mergedLayer: string[] = [];

    for (let i = 0; i < groups.length; i++) {
      const groupedText = groups[i]
        .map((item, idx) => `子摘要 ${idx + 1}:\n${item}`)
        .join('\n\n');

      const mergedSummary = await summarizeOnce(
        openai,
        model,
        `请将以下多个子摘要整合成更高层次的统一摘要，去重并保留关键信息：\n\n${groupedText}`,
        FINAL_SUMMARY_MAX_TOKENS
      );

      mergedLayer.push(mergedSummary);
    }

    currentLayer = mergedLayer;
  }

  return {
    summary: currentLayer[0],
    usedChunking: true,
    chunkCount: chunks.length,
    mergeRounds,
  };
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GITHUB_TOKEN;

    if (!apiKey) {
      return NextResponse.json({
        error: '未配置 OPENAI_API_KEY',
        errorType: 'CONFIG_ERROR',
        details: '请在环境变量中配置 OPENAI_API_KEY（本地为 my-app/.env.local，部署为 Vercel Environment Variables）'
      }, { status: 500 });
    }

    const { filename } = await req.json();
    
    if (!filename) {
      return NextResponse.json({ error: '缺少文件名' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 🔍 第一步：检查缓存
    const { data: cachedSummary, error: cacheError } = await supabaseAdmin
      .from('summaries')
      .select('*')
      .eq('filename', filename)
      .single();

    if (cachedSummary && !cacheError) {
      console.log('✅ 从缓存返回摘要:', filename);
      return NextResponse.json({
        summary: cachedSummary.summary,
        filename: cachedSummary.filename,
        textLength: cachedSummary.text_length,
        isTruncated: cachedSummary.is_truncated || false,
        warning: cachedSummary.warning || undefined,
        fromCache: true,
        cachedAt: cachedSummary.created_at
      });
    }

    // 📥 第二步：缓存未命中，从 Supabase Storage 下载文件
    console.log('⚠️ 缓存未命中，调用AI生成摘要:', filename);
    const { data, error } = await supabaseAdmin
      .storage
      .from('documents')
      .download(filename);

    if (error) {
      return NextResponse.json({ error: '文件下载失败: ' + error.message }, { status: 500 });
    }

    // 将文件内容转换为文本
    let text = await data.text();
    const originalLength = text.length;
    
    // 检查文本长度
    if (text.length === 0) {
      return NextResponse.json({ error: '文件内容为空' }, { status: 400 });
    }

    // 智能处理超长文本：自动截断而不是拒绝
    const MAX_LENGTH = 100000; // 支持最多 10 万字符
    let isTruncated = false;
    
    if (text.length > MAX_LENGTH) {
      text = text.substring(0, MAX_LENGTH);
      isTruncated = true;
    }

    // 🤖 第三步：调用 GitHub Models API 生成摘要（长文自动分块）
    const openai = getOpenAIClient();
    const model = process.env.AI_MODEL_NAME || process.env.GITHUB_MODEL || 'gpt-4o-mini';
    const summaryResult = await summarizeWithChunking(openai, model, text);
    const summary = summaryResult.summary;

    const warnings: string[] = [];
    if (isTruncated) {
      warnings.push(`原文过长（${originalLength} 字符），已截取前 ${MAX_LENGTH} 字符生成摘要`);
    }
    if (summaryResult.usedChunking) {
      warnings.push(`文档较长，已自动分块（${summaryResult.chunkCount} 块）并进行 ${summaryResult.mergeRounds} 轮汇总`);
    }
    const warningMsg = warnings.length > 0 ? warnings.join('；') : undefined;

    // 💾 第四步：保存到缓存
    const { error: insertError } = await supabaseAdmin
      .from('summaries')
      .insert({
        filename,
        summary,
        text_length: originalLength,
        is_truncated: isTruncated,
        warning: warningMsg
      });

    if (insertError) {
      console.error('⚠️ 缓存保存失败:', insertError);
      // 不影响返回结果，只记录错误
    } else {
      console.log('✅ 摘要已缓存:', filename);
    }

    return NextResponse.json({ 
      summary,
      filename,
      textLength: originalLength,
      isTruncated,
      truncatedLength: isTruncated ? MAX_LENGTH : undefined,
      warning: warningMsg,
      fromCache: false
    });

  } catch (error: any) {
    console.error('摘要生成错误:', error);
    
    // 处理速率限制错误
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('速率限制')) {
      return NextResponse.json({ 
        error: '⏰ 请求过于频繁，请稍后再试',
        errorType: 'RATE_LIMIT',
        details: 'GitHub Models API 有速率限制，请等待 1-2 分钟后重试，或检查您的配额。',
        solutions: [
          '等待 1-2 分钟后重试',
          '检查 GitHub 账户的模型调用额度是否用完',
          '更换为更轻量模型（例如 gpt-4o-mini）以降低配额消耗'
        ]
      }, { status: 429 });
    }
    
    // 处理认证错误
    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ 
        error: '🔑 API Key 无效',
        errorType: 'AUTH_ERROR',
        details: '请检查 OPENAI_API_KEY 是否正确配置，并确保 token 具备调用 GitHub Models 的权限',
      }, { status: 401 });
    }
    
    // 其他错误
    return NextResponse.json({ 
      error: '摘要生成失败: ' + (error.message || '未知错误'),
      errorType: 'GENERAL_ERROR',
      details: '请稍后重试，如果问题持续存在，请检查网络连接和 API 配置'
    }, { status: 500 });
  }
}
