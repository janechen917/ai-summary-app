export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}_${file.name}`;

  const { error } = await supabaseAdmin
    .storage
    .from('documents')
    .upload(filename, buffer, { contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${encodeURIComponent(filename)}`;

  return NextResponse.json({ url: publicUrl });
}
