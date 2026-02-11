export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin.storage.from('documents').list('', { limit: 100 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ files: data });
}
