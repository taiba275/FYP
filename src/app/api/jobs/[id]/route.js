// import { NextResponse } from "next/server";
// import { connectDB } from "../../../../library/mongodb";
// import Job from "../../../models/Job";
// import User from "../../../models/User";
// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";

// const SECRET = process.env.JWT_SECRET || "your-secret";

// // ==============================
// // DELETE /api/jobs/:id
// // ==============================
// export async function DELETE(req, { params }) {
//   await connectDB();
//   const { id } = await context.params;
//   const jobId = params.id;

//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;
//   if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const decoded = jwt.verify(token, SECRET);
//   const userId = decoded.userId;

//   const job = await Job.findById(jobId);
//   if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

//   if (job.userId.toString() !== userId) {
//     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
//   }

//   await Job.findByIdAndDelete(jobId);

//   await User.findByIdAndUpdate(userId, {
//     $pull: { jobsPosted: jobId },
//   });

//   return NextResponse.json({ success: true, message: "Job deleted successfully" });
// }

// // ==============================
// // GET /api/jobs/:id (for editing)
// // ==============================
// export async function GET(req, { params }) {
//   await connectDB();
//   const job = await Job.findById(params.id);
//   if (!job) {
//     return NextResponse.json({ message: "Job not found" }, { status: 404 });
//   }
//   return NextResponse.json({ job });
// }

// // ==============================
// // PUT /api/jobs/:id (update job)
// // ==============================
// export async function PUT(req, { params }) {
//   await connectDB();

//   const jobId = params.id;
//   const updates = await req.json();

//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;
//   if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//   const decoded = jwt.verify(token, SECRET);
//   const userId = decoded.userId;

//   const job = await Job.findById(jobId);
//   if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

//   if (job.userId.toString() !== userId) {
//     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
//   }

//   const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true });

//   return NextResponse.json({ success: true, job: updatedJob });
//   //return NextResponse.json(job);
// }

























// import { NextResponse } from "next/server";
// import { connectDB } from "../../../../library/mongodb";
// import Job from "../../../models/Job";
// import mongoose from "mongoose";

// export async function GET(req, { params }) {
//   await connectDB();
  
//   const { id } = params;

//   // Validate ID
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return NextResponse.json(
//       { success: false, message: "Invalid job ID" },
//       { status: 400 }
//     );
//   }

//   try {
//     const job = await Job.findById(id).lean();

//     if (!job) {
//       return NextResponse.json(
//         { success: false, message: "Job not found" },
//         { status: 404 }
//       );
//     }

//     // Convert ObjectId to string for client
//     job._id = job._id.toString();

//     return NextResponse.json(job);
//   } catch (error) {
//     console.error("GET /api/jobs/[id] error:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
























import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import Job from "../../../models/Job";
import User from "../../../models/User";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const SECRET = process.env.JWT_SECRET || "your-secret";

// ==============================
// GET /api/jobs/:id (for view + edit)
// ==============================
export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid job ID" },
      { status: 400 }
    );
  }

  const job = await Job.findById(id).lean();
  if (!job) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }

  job._id = job._id.toString(); // ✅ convert ObjectId for client

  return NextResponse.json(job); // ✅ send job directly (not inside `{ job: ... }`)
}

// ==============================
// PUT /api/jobs/:id (update job)
// ==============================
export async function PUT(req, { params }) {
  await connectDB();

  const jobId = params.id;
  const updates = await req.json();

  const cookieStore = cookies();
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
}

// ==============================
// DELETE /api/jobs/:id
// ==============================
export async function DELETE(req, { params }) {
  await connectDB();
  const jobId = params.id;

  const cookieStore = cookies();
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


