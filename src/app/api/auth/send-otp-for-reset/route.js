// /api/auth/send-reset-otp/route.js
import { connectDB } from '../../../../library/mongodb';
import User from '../../../models/User';
import { NextResponse } from 'next/server';
import { sendEmail } from '../../../../library/mailer';
import crypto from 'crypto';

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Your Password Reset OTP',
      text: `Your OTP is: ${otp}`,
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

    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error sending reset OTP:', err);
    return NextResponse.json({ success: false, message: 'Server error', error: err.message }, { status: 500 });
  }
}
