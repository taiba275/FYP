import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import Job from "../../../models/Job";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "../../../models/User";

const SECRET = process.env.JWT_SECRET || "your-secret";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Extract userId from JWT stored in cookies
const cookieStore = await cookies(); // ✅ Await it
    const token = cookieStore.get("token")?.value;
if (!token) {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

const decoded = jwt.verify(token, SECRET);
const userId = decoded.userId; // ✅ your token uses "userId" not "id"

console.log("🔍 JWT Token:", token);
console.log("🔍 Decoded userId:", userId);

    // Destructure required fields from frontend
    const {
      jobTitle,
      companyName,
      companyEmail,
      jobRole,
      jobLocation,
      city,
      gender,
      education,
      degreeTitle,
      minExperience,
      maxExperience,
      currency,
      minSalary,
      maxSalary,
      skills,
      industry,
      industryOther,
      functionalArea,
      functionalAreaOther,
      totalPositions,
      jobShift,
      jobType,
      applyBefore,
      postingDate,
      jobDescription,
      
    } = body;

    const finalIndustry = industry === "Other" ? industryOther : industry;
    const finalFunctionalArea = functionalArea === "Other" ? functionalAreaOther : functionalArea;

    const newJob = new Job({
      Title: jobTitle,
      Company: companyName,
      CompanyEmail: companyEmail,
      "Job Location": jobLocation,
      City: city,
      Description: jobDescription || "",
      Salary: `${minSalary} - ${maxSalary} ${currency}`,
      currency,
      salary_lower: minSalary || "not mentioned",
      salary_upper: maxSalary || "not mentioned",
      Skills: skills,
      Industry: finalIndustry,
      "Functional Area": finalFunctionalArea,
      "Total Positions": totalPositions ? `${totalPositions} post` : "1 post",
      "Job Shift": jobShift,
      "Job Type": jobType,
      Gender: gender,
      "Minimum Education": education,
      "Degree Title": degreeTitle,
      "Career Level": "Not Specified", // optional field
      "Apply Before": applyBefore,
      "Posting Date": postingDate,
      Experience: `${minExperience} years - ${maxExperience} years`,
      "Experience Range": `(${minExperience}, ${maxExperience})`,
      ExtractedRole: jobRole,
      JobURL: "", // Can be added later
      userId, // Save who created it
      
    });

    await newJob.save();

    await User.findByIdAndUpdate(userId, {
  $push: { jobsPosted: newJob._id }
});







    // NEWLY ADDED CODE FOR AUTOMATIC UPDATE IN RECOMMENDATION JOBS
    console.log("✅ Job created with ID:", newJob._id);

    // 🔁 Call FastAPI to update FAISS index
    try {
      const fastapiURL = "http://localhost:8001/update-faiss"; // Change to deployed URL if needed
      await fetch(fastapiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: newJob._id,
          title: jobTitle,
          skills: skills,
          description: jobDescription || "",
        }),
      });
      console.log("📡 FAISS index updated for job:", newJob._id);
    } catch (err) {
      console.error("❌ Failed to update FAISS index:", err.message);
    }

    return NextResponse.json({ success: true, jobId: newJob._id });

  } catch (error) {
    console.error("❌ Error in POST job:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}



