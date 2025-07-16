import { connectDB } from '../../../../library/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const SECRET = process.env.JWT_SECRET || 'your-secret';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password, username } = await request.json();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Email already in use.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

    // ✅ Save user with OTP
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp,
      otpExpires,
      emailVerified: false
    });

    await user.save();

    // ✅ Send OTP email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Job Portal" <no-reply@yourdomain.com>',
      to: email,
      subject: 'Your OTP Code',
      html: `<h2>Your OTP is: ${otp}</h2><p>This code expires in 10 minutes.</p>`,
    });

    return NextResponse.json({ success: true, message: 'OTP sent to email' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
