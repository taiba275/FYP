import { connectDB } from '../../../../library/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret';

export async function POST(request) {
  try {
    // Connect to the DB
    await connectDB();
    
    const { email, password } = await request.json();

    // Trim spaces from email and password to avoid issues
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check if the user exists
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token with userId and email
    const token = jwt.sign({ userId: user._id, email: user.email }, SECRET, { expiresIn: '7d' });

    // Create response and set the token in a cookie
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Setting the token in the cookie with HTTPOnly, Secure, SameSite, and expiration time
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Set to true in production for HTTPS
      sameSite: 'lax',  // Can be changed depending on cross-origin requirements
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // Cookie expires in 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
