import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const { code } = body;

  const myCode = process.env.MY_CODE;
  const wifeCode = process.env.WIFE_CODE;

  if (code === myCode) {
    return NextResponse.json({ valid: true, userType: 'me' });
  }

  if (code === wifeCode) {
    return NextResponse.json({ valid: true, userType: 'wife' });
  }

  return NextResponse.json({ valid: false });
}
