import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('image');
  if (!file) {
    return NextResponse.json({ message: '파일이 없습니다.' }, { status: 400 });
  }
  return NextResponse.json({ message: '파일 업로드 완료 (Vercel 메모리 모드)', imageUrl: '' });
}
