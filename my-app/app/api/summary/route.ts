export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import getSupabaseAdmin from '../../../lib/supabaseAdmin';

// 延迟初始化 OpenAI 客户端，避免构建时错误
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.ZHIPU_API_KEY || '',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
  });
}

export async function POST(req: Request) {
  try {
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

    // 🤖 第三步：调用智谱 AI API 生成摘要
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "glm-4-flash", // 智谱 AI 模型（更快更便宜，也可以用 glm-4）
      messages: [
        {
          role: "system",
          content: "你是一个专业的文档摘要助手。请为用户提供的文档生成简洁、准确的摘要，突出重点内容。用中文回答。"
        },
        {
          role: "user",
          content: `请为以下文档生成摘要：\n\n${text}`
        }
      ],
      max_tokens: 800, // 增加摘要长度限制
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content || '无法生成摘要';
    const warningMsg = isTruncated ? `原文过长（${originalLength} 字符），已截取前 ${MAX_LENGTH} 字符生成摘要` : undefined;

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
        details: '智谱 AI API 有速率限制，请等待 1-2 分钟后重试，或检查您的账户额度。',
        solutions: [
          '等待 1-2 分钟后重试',
          '检查智谱 AI 控制台的免费额度是否用完',
          '考虑升级为付费账户以获得更高的速率限制'
        ]
      }, { status: 429 });
    }
    
    // 处理认证错误
    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ 
        error: '🔑 API Key 无效',
        errorType: 'AUTH_ERROR',
        details: '请检查您的智谱 AI API Key 是否正确配置',
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
