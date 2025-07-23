// /app/api/auth/facebook/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/library/mongodb";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "your-secret";

// Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req) {
  try {
    await connectDB();

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    // Verify the Firebase ID token
    const decoded = await getAuth().verifyIdToken(token);
    const { email, name, picture } = decoded;

    // Find or create user
    let user = await User.findOne({ email });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await User.create({
        username: name || email.split("@")[0],
        email,
        emailVerified: true,
        photo: picture || "",
        provider: "google", // or "facebook"
      });
    }

    // Create session token
    const payload = {
      id: user._id.toString(),
      email: user.email,
    };

    const sessionToken = jwt.sign(payload, SECRET, { expiresIn: "7d" });

    // Set JWT cookie
    const cookieStore = await cookies(); // ✅ AWAIT here
    cookieStore.set("token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    

    return NextResponse.json({ user, isNewUser }, { status: 200 });
  } catch (err) {
    console.error("Facebook login error:", err);
    return NextResponse.json(
      { message: "Facebook login failed", error: err.message },
      { status: 401 }
    );
  }
}
