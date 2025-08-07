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
      from: '"JobFinder." <no-reply@yourdomain.com>',
      to: trimmedEmail,
      subject: 'Your Login OTP',
      html: `
        <!-- Load Inter font -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">

        <div style="font-family: 'Inter', 'Segoe UI', sans-serif; background: #f9f9fb; padding: 40px 24px; border-radius: 12px; text-align: center; max-width: 480px; margin: 0 auto;">
          <!-- Bolder title + More spacing -->
          <h1 style="font-size: 38px; font-weight: 900; margin-bottom: 30px;">JobFinder.</h1>

          <!-- Email verification heading -->
          <h2 style="font-size: 22px; font-weight: 600; margin: 0;">Verify your email</h2>

          <p style="font-size: 16px; line-height: 1.5; color: #333;">Use the following one-time code to complete your login:</p>

          <!-- OTP block -->
          <div style="margin: 24px auto; font-family: monospace; font-size: 28px; font-weight: bold; background: #fff; padding: 16px 24px; border: 1px solid #ccc; border-radius: 8px; width: fit-content; letter-spacing: 6px; cursor: pointer;"
              onclick="navigator.clipboard.writeText('${otp}')">
            ${otp}
          </div>

          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.<br>If you didn’t request this, you can safely ignore this email.</p>

          <!-- Footer -->
          <div style="margin-top: 32px; border-top: 1px solid #ddd; padding-top: 16px; font-size: 12px; color: #aaa;">
            Job Portal, effortless hiring starts here.<br>
            © ${new Date().getFullYear()} Job Portal. All rights reserved.
          </div>
        </div>
      `
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
