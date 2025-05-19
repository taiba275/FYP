import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();
  const { email, otp, newEmail, newPassword } = await req.json();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
  if (!user.otp || !user.otpExpiry || user.otp !== otp || user.otpExpiry < new Date()) {
    return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
  }
  // Change email or password as needed
  if (newEmail) user.email = newEmail;
  if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return NextResponse.json({ message: "Updated" });
}
