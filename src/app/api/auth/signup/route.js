// Import necessary modules
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../library/mongodb';


// Handler for POST requests
export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const { email, password } = await request.json();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already in use.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();
    return NextResponse.json(
      { success: true, message: 'User created successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// If you also handle GET requests, define a handler for them
export function get(req, res) {
  res.status(405).json({ message: "GET method not allowed for signup" });
}
