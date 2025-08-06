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
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Verify token
    const user = jwt.verify(token, SECRET);

    // Return user info
    return NextResponse.json(
      {
        authenticated: true,
        user,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }  catch (error) {
      let message = "Invalid or expired token";
      if (error.name === "TokenExpiredError") {
        message = "Token has expired";
      } else if (error.name === "JsonWebTokenError") {
        message = "Malformed token";
      }
    
      return NextResponse.json(
        { authenticated: false, message },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }
}