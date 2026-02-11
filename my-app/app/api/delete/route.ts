export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.json();
  const key = body?.key;
  if (!key) return NextResponse.json({ error: 'missing key' }, { status: 400 });

  const { error } = await supabaseAdmin.storage.from('documents').remove([key]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
