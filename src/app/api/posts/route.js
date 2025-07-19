import { connectDB } from "../../../library/mongodb";
import Job from '../../models/Job';

const experienceMapping = {
  "0": ["(0, 1)", "(1, 2)"],
  "1": ["(1, 2)", "(0, 1)"],
  "2": ["(2, 3)", "(1, 2)"],
  "3": ["(3, 4)", "(2, 3)"],
  "4": ["(4, 5)", "(3, 4)"],
  "5": ["(4, 5)", "(5, 10)"],
  "Not mentioned": []
};

function parseFormattedDate(ddmmyyyy) {
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day);
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const city = searchParams.get("city") || "";
    const salaryOrder = searchParams.get("salaryOrder")?.toLowerCase() || "";
    const sortOrder = searchParams.get("sortOrder")?.toLowerCase() || "";
    const experience = searchParams.get("experience") || "";
    const limit = parseInt(searchParams.get("limit")) || 20;
    const page = parseInt(searchParams.get("page")) || 1;

    let query = {};

    if (search) {
      query.Title = { $regex: `^${search}`, $options: "i" };
    }
    if (category) {
      query.Industry = { $regex: `\\b${category}\\b`, $options: "i" };
    }
    if (type) {
      query["Job Type"] = { $regex: `^${type}$`, $options: "i" };
    }
    if (city) {
      query.City = { $regex: `^${city}$`, $options: "i" };
    }
    if (experience) {
      const mappedRanges = experienceMapping[experience];
      if (mappedRanges && mappedRanges.length > 0) {
        query["Experience Range"] = { $in: mappedRanges };
      }
    }

    const skip = (page - 1) * limit;

    let allJobs = await Job.find(query).lean();

    // Filter out jobs missing Salary Lower when sorting by salary
    if (salaryOrder === "ascending") {
      allJobs = allJobs
        .filter(job => typeof job["Salary Lower"] === "number")
        .sort((a, b) => a["Salary Lower"] - b["Salary Lower"]);
    } else if (salaryOrder === "descending") {
      allJobs = allJobs
        .filter(job => typeof job["Salary Lower"] === "number")
        .sort((a, b) => b["Salary Lower"] - a["Salary Lower"]);
    }

    // Sort by Formatted Posting Date (dd/mm/yyyy)
    if (sortOrder === "newest") {
      allJobs = allJobs
        .filter(job => job["Formatted Posting Date"])
        .sort((a, b) => parseFormattedDate(b["Formatted Posting Date"]) - parseFormattedDate(a["Formatted Posting Date"]));
    } else if (sortOrder === "oldest") {
      allJobs = allJobs
        .filter(job => job["Formatted Posting Date"])
        .sort((a, b) => parseFormattedDate(a["Formatted Posting Date"]) - parseFormattedDate(b["Formatted Posting Date"]));
    }

    const totalJobs = allJobs.length;
    const paginatedJobs = allJobs.slice(skip, skip + limit);

    return new Response(JSON.stringify({
      jobs: paginatedJobs,
      total: totalJobs
    }), { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching jobs", error: error.message }),
      { status: 500 }
    );
  }
}
