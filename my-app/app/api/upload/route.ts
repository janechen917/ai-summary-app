export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import getSupabaseAdmin from '../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: '文件为空' }, { status: 400 });
  }

  const safeName = sanitizeFilename(file.name);
  const filename = `${Date.now()}_${safeName}`;

  const { error } = await supabaseAdmin
    .storage
    .from('documents')
    .upload(filename, buffer, { contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${encodeURIComponent(filename)}`;

  return NextResponse.json({ url: publicUrl });
}

function sanitizeFilename(name: string) {
  // 保留扩展名，只允许字母数字、连字符、下划线和点
  const lastDot = name.lastIndexOf('.')
  const ext = lastDot !== -1 ? name.slice(lastDot) : ''
  const base = lastDot !== -1 ? name.slice(0, lastDot) : name
  const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, '_')
  return safeBase + ext
}

export async function POST_SAFE(req: Request) {
  // 备用导出，保持兼容性（未被调用）
  return POST(req)
}
