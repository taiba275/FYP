import { connectDB } from '../../../../library/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    // Connect to the DB
    await connectDB();

    const { email, password } = await request.json();

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

    // Match password
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check email verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email before logging in.' },
        { status: 403 }
      );
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Job Portal" <no-reply@yourdomain.com>',
      to: trimmedEmail,
      subject: 'Your Login OTP',
      html: `<h2>Your OTP is: ${otp}</h2><p>This OTP expires in 10 minutes.</p>`,
    });

    return NextResponse.json(
      { success: true, message: 'OTP sent to your email. Please verify to complete login.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
