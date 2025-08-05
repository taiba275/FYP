import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import Job from "../../../models/Job";
import User from "../../../models/User";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret";

// ==============================
// DELETE /api/jobs/:id
// ==============================
export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = await context.params;
  const jobId = params.id;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwt.verify(token, SECRET);
  const userId = decoded.userId;

  const job = await Job.findById(jobId);
  if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

  if (job.userId.toString() !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await Job.findByIdAndDelete(jobId);

  await User.findByIdAndUpdate(userId, {
    $pull: { jobsPosted: jobId },
  });

  return NextResponse.json({ success: true, message: "Job deleted successfully" });
}

// ==============================
// GET /api/jobs/:id (for editing)
// ==============================
export async function GET(req, { params }) {
  await connectDB();
  const job = await Job.findById(params.id);
  if (!job) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({ job });
}

// ==============================
// PUT /api/jobs/:id (update job)
// ==============================
export async function PUT(req, { params }) {
  await connectDB();

  const jobId = params.id;
  const updates = await req.json();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = jwt.verify(token, SECRET);
  const userId = decoded.userId;

  const job = await Job.findById(jobId);
  if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

  if (job.userId.toString() !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true });

  return NextResponse.json({ success: true, job: updatedJob });
  //return NextResponse.json(job);
}
