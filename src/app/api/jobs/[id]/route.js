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

  job._id = job._id.toString();

  const url = new URL(req.url);
  const raw = url.searchParams.get("raw");

if (raw !== "false") {
  return NextResponse.json(job); // ✅ default is raw
}

return NextResponse.json({ job }); // only wrapped if ?raw=false

}


export async function PUT(req, { params }) {
  try {
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

    const body = await req.json();
    console.log("🛠️ Payload received:", body);

    const updateData = {
      Title: body.jobTitle,
      Company: body.companyName,
      CompanyEmail: body.companyEmail,
      "Job Location": body.jobLocation,
      City: body.city,
      Gender: body.gender,
      "Minimum Education": body.education,
      "Degree Title": body.degreeTitle,
      Experience: `${body.minExperience} years - ${body.maxExperience} years`,
      "Experience Range": `(${body.minExperience}, ${body.maxExperience})`,
      currency: body.currency,
      salary_lower: Number(body.minSalary),
      salary_upper: Number(body.maxSalary),
      Skills: body.skills,
      Industry: body.industry,
      "Functional Area": body.functionalArea,
      "Total Positions": `${body.totalPositions} post`,
      "Job Shift": body.jobShift,
      "Job Type": body.jobType,
      "Apply Before": body.applyBefore,
      "Posting Date": body.postingDate,
      Description: body.jobDescription,
      ExtractedRole: body.jobRole,
    };

    console.log("🔧 Mapped update data:", updateData);

    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, userId: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedJob) return NextResponse.json({ message: "Update failed" }, { status: 400 });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (err) {
    console.error("🔥 Error in PUT:", err);
    return NextResponse.json({ message: "Internal Server Error", error: err.message }, { status: 500 });
  }
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

  let userId;
  try {
    const decoded = jwt.verify(token, SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const job = await Job.findById(jobId);
  if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

  if (job.userId.toString() !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await Job.findByIdAndDelete(jobId);
  await User.findByIdAndUpdate(userId, {
    $pull: { jobsPosted: jobId },
  });

  // 🔁 NEW: Call FastAPI to delete from FAISS
  try {
    const fastapiURL = "http://localhost:8001/delete-faiss"; // Change to deployed URL
    await fetch(fastapiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    console.log("🗑️ FAISS vector deleted for job:", jobId);
  } catch (err) {
    console.error("❌ Failed to delete FAISS vector:", err.message);
  }

  return NextResponse.json({ success: true, message: "Job deleted successfully" });
}


