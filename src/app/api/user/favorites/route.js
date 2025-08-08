// C:\Projects\FYP\src\app\api\user\favorites\route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import User from "../../../models/User";
import Job from "../../../models/Job";
import { getUserFromRequest } from "../../../../utils/auth";

// GET: fetch all favorite jobs
export async function GET(req) {
  await connectDB();
  const userInfo = getUserFromRequest(req);
  if (!userInfo) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const user = await User.findOne({ email: userInfo.email }).populate("favoriteJobs");
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  return NextResponse.json({ favorites: user.favoriteJobs }, { status: 200 });
}

// PUT: add or remove a job from favorites
export async function PUT(req) {
  await connectDB();
  const userInfo = getUserFromRequest(req);
  if (!userInfo) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ message: "Missing jobId" }, { status: 400 });

  const user = await User.findOne({ email: userInfo.email });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const index = user.favoriteJobs.findIndex((id) => id.toString() === jobId);
  if (index > -1) {
    user.favoriteJobs.splice(index, 1); // remove
  } else {
    user.favoriteJobs.push(jobId); // add
  }

  await user.save();
  return NextResponse.json({ success: true, favorites: user.favoriteJobs }, { status: 200 });
}

// DELETE: clear all favorites  <-- NEW
export async function DELETE(req) {
  await connectDB();
  const userInfo = getUserFromRequest(req);
  if (!userInfo) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const user = await User.findOne({ email: userInfo.email });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  user.favoriteJobs = [];
  await user.save();

  return NextResponse.json({ success: true, favorites: [] }, { status: 200 });
}
