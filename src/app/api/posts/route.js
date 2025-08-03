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

    // Construct match query
    let match = {};

    if (search) {
      const regex = new RegExp(search.split(" ").join(".*"), "i");
      match.$or = [
        { Title: { $regex: regex } },
        { Company: { $regex: regex } },
        { Skills: { $regex: regex } },
        { FunctionalArea: { $regex: regex } },
        { ExtractedRole: { $regex: regex } },
      ];
    }

    if (category) {
      match.Industry = { $regex: `\\b${category}\\b`, $options: "i" };
    }
    if (type) {
      match["Job Type"] = { $regex: `^${type}$`, $options: "i" };
    }
    if (city) {
      match.City = { $regex: `^${city}$`, $options: "i" };
    }
    if (experience) {
      const mappedRanges = experienceMapping[experience];
      if (mappedRanges && mappedRanges.length > 0) {
        match["Experience Range"] = { $in: mappedRanges };
      }
    }

    // Start building full aggregation pipeline
    const pipeline = [{ $match: match }];

    // Salary sort (numeric only)
    if (salaryOrder === "ascending" || salaryOrder === "descending") {
      pipeline.push({ $match: { salary_lower: { $type: "number" } } });
      pipeline.push({ $sort: { salary_lower: salaryOrder === "ascending" ? 1 : -1 } });
    }

    // Date sort (convert string to date)
    if (sortOrder === "newest" || sortOrder === "oldest") {
      pipeline.push({
        $match: { "Posting Date": { $regex: "^\\d{1,2}/\\d{1,2}/\\d{4}$" } }
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
      pipeline.push({ $match: { parsedDate: { $ne: null } } });
      pipeline.push({ $sort: { parsedDate: sortOrder === "newest" ? -1 : 1 } });
    }

    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Execute paginated query
    const jobs = await Job.aggregate(pipeline);

    // Accurate total count (only match stage, no sort/limit)
    const totalPipeline = [{ $match: match }, { $count: "count" }];
    const totalResult = await Job.aggregate(totalPipeline);
    const total = totalResult[0]?.count || 0;

    return new Response(JSON.stringify({ jobs, total }), { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching jobs", error: error.message }),
      { status: 500 }
    );
  }
}
