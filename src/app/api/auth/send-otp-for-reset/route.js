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
      html: `<p>Your password reset OTP is:</p><h2>${otp}</h2><p>This code will expire in 10 minutes.</p>`,
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error sending reset OTP:', err);
    return NextResponse.json({ success: false, message: 'Server error', error: err.message }, { status: 500 });
  }
}
