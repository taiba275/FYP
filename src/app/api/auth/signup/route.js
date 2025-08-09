import { connectDB } from '../../../../library/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password, username } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail || !password || !username) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // Prepare OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Check existing user
    let existing = await User.findOne({ email: normalizedEmail });

    // Case 1: User exists and already verified -> conflict
    if (existing && existing.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email already in use.' },
        { status: 409 }
      );
    }

    // Case 2: User exists but NOT verified -> refresh OTP and resend (no duplicates)
    if (existing && !existing.emailVerified) {
      existing.otp = otp;
      existing.otpExpires = otpExpires;
      await existing.save();

      try {
        await transporter.sendMail({
          from: '"Job Portal" <no-reply@yourdomain.com>',
          to: normalizedEmail,
          subject: 'Your OTP Code',
          html: `<h2>Your OTP is: ${otp}</h2><p>This code expires in 10 minutes.</p>`,
        });
      } catch (err) {
        return NextResponse.json(
          { success: false, message: 'Failed to send OTP email', error: err.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'OTP re-sent to email' },
        { status: 200 }
      );
    }

    // Case 3: New user -> create but ROLLBACK if email fails
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      otp,
      otpExpires,
      emailVerified: false,
      provider: 'local',
    });

    try {
      await transporter.sendMail({
        from: '"Job Portal" <no-reply@yourdomain.com>',
        to: normalizedEmail,
        subject: 'Your OTP Code',
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
      `,
      });
    } catch (err) {
      // 🔁 rollback database insert so no dangling records
      await User.deleteOne({ _id: newUser._id });
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP email', error: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'OTP sent to email' },
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
