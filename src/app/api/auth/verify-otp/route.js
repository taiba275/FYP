import { connectDB } from '../../../../library/mongodb';
import User from '../../../models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret';

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // ✅ Mark email verified and clear OTP
    user.emailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // ✅ Create JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, SECRET, { expiresIn: '7d' });

    // ✅ Set cookie with token
    const response = NextResponse.json({ success: true, message: 'Email verified successfully' });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
