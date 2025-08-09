// /app/api/auth/github/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/library/mongodb";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "your-secret";

// Initialize Firebase Admin once
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

    // Verify Firebase ID token coming from GitHub sign-in
    const decoded = await getAuth().verifyIdToken(token);

    // Firebase may not always provide email from GitHub unless scope user:email is granted
    const { email, name, picture } = decoded;

    if (!email) {
      // As a fallback, block sign-in if email isn't present/verified
      return NextResponse.json(
        { message: "GitHub did not return an email. Make sure 'user:email' scope is enabled and a public/primary email exists." },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        username: name || email.split("@")[0],
        email,
        emailVerified: true,
        photo: picture || "",
        provider: "github",
      });
    }

    const payload = { id: user._id.toString(), email: user.email };
    const sessionToken = jwt.sign(payload, SECRET, { expiresIn: "7d" });

    const cookieStore = await cookies(); // keeping consistent with your other routes
    cookieStore.set("token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({ user, isNewUser }, { status: 200 });
  } catch (err) {
    console.error("GitHub login error:", err);
    return NextResponse.json(
      { message: "GitHub login failed", error: err.message },
      { status: 401 }
    );
  }
}
