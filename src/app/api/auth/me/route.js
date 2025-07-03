import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret';

export async function GET(req) {
  try {
    // Get token from cookies
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const user = jwt.verify(token, SECRET);
    // Return user info (customize as needed)
    return NextResponse.json({
      authenticated: true,
      user
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
