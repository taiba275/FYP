import { NextResponse } from 'next/server';

export async function POST() {
  // Create response to clear the cookie
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("token", "", {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: 'lax',
  path: '/',
  maxAge: 0
});
  return response;
}
