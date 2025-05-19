import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import User from "../../../../models/User";
import nodemailer from "nodemailer";

export async function POST(req) {
  await connectDB();
  const { email, type } = await req.json(); // type: "email" or "password"
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  // Send OTP by email
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your SMTP config
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Code",
    text: `Your OTP code is: ${otp}`,
  });

  return NextResponse.json({ message: "OTP sent" });
}
