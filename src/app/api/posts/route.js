import { connectDB } from "../../../library/mongodb";
import Job from '../../models/Job';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const city = searchParams.get("city") || "";
    const salaryOrder = searchParams.get("salaryOrder") || "";
    const experience = searchParams.get("experience") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const limit = parseInt(searchParams.get("limit")) || 20;
    const page = parseInt(searchParams.get("page")) || 1;

    let query = {};

    if (search) {
      query.Title = { $regex: `^${search}`, $options: "i" };
    }
    if (category) {
      query.Industry = { $regex: `^${category}$`, $options: "i" }; // exact match ignoring case
    }
    if (type) {
      query["Job Type"] = { $regex: `^${type}$`, $options: "i" };
    }
    if (city) {
      query.City = { $regex: `^${city}$`, $options: "i" };
    }
    if (experience) {
      query.Experience = { $regex: `^${experience}$`, $options: "i" };
    }
    if (dateFrom) {
      query["Posting Date"] = {};
      query["Posting Date"].$gte = new Date(dateFrom);
    }

    const skip = (page - 1) * limit;

    let jobs = await Job.find(query).skip(skip).limit(limit).lean();


    if (salaryOrder === "ascending") {
      jobs.sort(
        (a, b) =>
          parseInt(a.Salary.replace(/\D/g, "")) -
          parseInt(b.Salary.replace(/\D/g, ""))
      );
    } else if (salaryOrder === "descending") {
      jobs.sort(
        (a, b) =>
          parseInt(b.Salary.replace(/\D/g, "")) -
          parseInt(a.Salary.replace(/\D/g, ""))
      );
    }

    return new Response(JSON.stringify(jobs), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching jobs", error: error.message }),
      { status: 500 }
    );
  }
}
