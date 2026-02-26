export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import getSupabaseAdmin from '../../../lib/supabaseAdmin';

// 获取所有摘要历史记录
export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // 从数据库获取所有摘要，按创建时间倒序
    const { data: summaries, error } = await supabaseAdmin
      .from('summaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); // 限制返回50条

    if (error) {
      console.error('获取历史记录失败:', error);
      return NextResponse.json(
        { error: '获取历史记录失败: ' + error.message },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const formattedSummaries = summaries.map(item => ({
      id: item.id,
      filename: item.filename,
      summary: item.summary,
      textLength: item.text_length,
      isTruncated: item.is_truncated || false,
      warning: item.warning,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return NextResponse.json({
      success: true,
      count: formattedSummaries.length,
      summaries: formattedSummaries
    });

  } catch (error: any) {
    console.error('获取历史记录错误:', error);
    return NextResponse.json(
      { error: '服务器错误: ' + (error.message || '未知错误') },
      { status: 500 }
    );
  }
}
