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

    const skip = (page - 1) * limit;

    // Construct query object
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

    // Aggregation pipeline
    const pipeline = [
      { $match: query }
    ];

    // Salary sort
    if (salaryOrder === "ascending") {
      pipeline.push({ $match: { salary_lower: { $type: "number" } } });
      pipeline.push({ $sort: { salary_lower: 1 } });
    } else if (salaryOrder === "descending") {
      pipeline.push({ $match: { salary_lower: { $type: "number" } } });
      pipeline.push({ $sort: { salary_lower: -1 } });
    }

    // Date sort
    if (sortOrder === "newest" || sortOrder === "oldest") {
    pipeline.push({
      $match: {
        "Posting Date": { $regex: "^\\d{1,2}/\\d{1,2}/\\d{4}$" }
      }
    });
  
    pipeline.push({
      $addFields: {
        parsedDate: {
          $dateFromString: {
            dateString: "$Posting Date",
            format: "%d/%m/%Y"
          }
        }
      }
    });
  
    pipeline.push({
      $match: {
        parsedDate: { $ne: null }
      }
    });
  
    pipeline.push({
      $sort: { parsedDate: sortOrder === "newest" ? -1 : 1 }
    });
  }
  

    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Get jobs
    const jobs = await Job.aggregate(pipeline);

    // Get total count
    const countPipeline = [{ $match: query }, { $count: "count" }];
    const totalResult = await Job.aggregate(countPipeline);
    const totalJobs = totalResult[0]?.count || 0;

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
