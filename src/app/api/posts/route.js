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

    let jobs = await Job.find(query).skip(skip).limit(limit).lean();

    // 🔽 Sort by Salary
    function extractLowerSalary(salaryString) {
      if (!salaryString) return 0;
      const match = salaryString.match(/(\d[\d,]*)\s*-\s*(\d[\d,]*)/);
      if (match) {
        const lower = match[1].replace(/,/g, "");
        return parseInt(lower);
      }
      return 0;
    }

    if (salaryOrder === "ascending") {
      jobs = jobs
        .filter(job => extractLowerSalary(job.Salary) > 0)
        .sort((a, b) => extractLowerSalary(a.Salary) - extractLowerSalary(b.Salary));
    } else if (salaryOrder === "descending") {
      jobs = jobs
        .filter(job => extractLowerSalary(job.Salary) > 0)
        .sort((a, b) => extractLowerSalary(b.Salary) - extractLowerSalary(a.Salary));
    }

    // 🔽 Sort by Posting Date (NEW)
    // 🔽 Date parsing helper
    function parsePostingDate(dateStr) {
      if (!dateStr) return new Date(0); // Fallback
      const [day, monStr, year] = dateStr.toLowerCase().split("-");
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = months[monStr];
      const fullYear = parseInt(year) + 2000; // Assuming all dates are 20xx
      return new Date(fullYear, month, parseInt(day));
    }

    function isValidDate(d) {
      return d instanceof Date && !isNaN(d);
    }

    if (sortOrder === "newest") {
      jobs = jobs
        .filter(job => isValidDate(parsePostingDate(job["Posting Date"])))
        .sort((a, b) => parsePostingDate(b["Posting Date"]) - parsePostingDate(a["Posting Date"]));
    } else if (sortOrder === "oldest") {
      jobs = jobs
        .filter(job => isValidDate(parsePostingDate(job["Posting Date"])))
        .sort((a, b) => parsePostingDate(a["Posting Date"]) - parsePostingDate(b["Posting Date"]));
    }



    const totalJobs = await Job.countDocuments(query);

    return new Response(JSON.stringify({
      jobs,
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
