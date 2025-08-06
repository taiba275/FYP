import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import Job from "../../../models/Job";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";


const SECRET = process.env.JWT_SECRET || "your-secret";

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ success: false, message: "Job ID is required" }, { status: 400 });
    }

    // 🔒 Verify user
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.userId;

    // 🔍 Fetch the job to verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 });
    }

    if (job.userId.toString() !== userId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // 🗑 Delete the job
    await Job.findByIdAndDelete(jobId);

    // 🧹 Remove job from user's jobsPosted
    await User.findByIdAndUpdate(userId, {
      $pull: { jobsPosted: jobId },
    });

    // 🧠 Call FastAPI to delete from FAISS
    try {
      const fastapiURL = "http://localhost:8001/delete-faiss";
      await fetch(fastapiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      console.log("📡 FAISS index updated (deleted job):", jobId);
    } catch (faissErr) {
      console.error("❌ Failed to delete from FAISS index:", faissErr.message);
      // still return success, since Mongo delete succeeded
    }

    return NextResponse.json({ success: true, message: "Job deleted" });

  } catch (err) {
    console.error("❌ Error deleting job:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
