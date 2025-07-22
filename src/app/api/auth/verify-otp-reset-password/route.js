// /api/auth/reset-password-otp/route.js
import { connectDB } from '../../../../library/mongodb';
import User from '../../../models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await request.json();

    const user = await User.findOne({ email: email.toLowerCase(), otp });

    if (!user || user.otpExpires < new Date()) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword.trim(), 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
