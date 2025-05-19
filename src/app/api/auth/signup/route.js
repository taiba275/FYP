import { connectDB } from '../../../../library/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password, username } = await request.json();

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already in use.' },
        { status: 409 }
      );
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the new user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    // Create JWT token with username and email
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      SECRET, 
      { expiresIn: '7d' }
    );

    // Return success response and set the cookie
    const response = NextResponse.json(
      { success: true, message: 'User created successfully' },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Set to true in production for HTTPS
      sameSite: 'lax',  // Adjust this as needed
      path: "/",
      maxAge: 60 * 60 * 24 * 7  // Cookie expires in 7 days
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
