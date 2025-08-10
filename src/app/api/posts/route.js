import { connectDB } from "../../../library/mongodb";
import Job from "../../models/Job";

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

    const search      = (searchParams.get("search") || "");
    const category    = (searchParams.get("category") || "");
    const type        = (searchParams.get("type") || "");
    const city        = (searchParams.get("city") || "");
    const salaryOrder = (searchParams.get("salaryOrder") || "").trim().toLowerCase();
    const sortOrder   = (searchParams.get("sortOrder") || "").trim().toLowerCase();
    const experience  = (searchParams.get("experience") || "");
    const limit = parseInt(searchParams.get("limit")) || 20;
    const page  = parseInt(searchParams.get("page")) || 1;
    const skip  = (page - 1) * limit;

    const baseMatch = {};
    if (search) {
      const regex = new RegExp(search.split(" ").join(".*"), "i");
      baseMatch.$or = [
        { Title: { $regex: regex } },
        { Company: { $regex: regex } },
        { Skills: { $regex: regex } },
        { FunctionalArea: { $regex: regex } },
        { ExtractedRole: { $regex: regex } },
      ];
    }
    if (category) baseMatch.ExtractedRole = { $regex: `\\b${category}\\b`, $options: "i" };
    if (type)     baseMatch["Job Type"]   = { $regex: `^${type}$`, $options: "i" };
    if (city)     baseMatch.City          = { $regex: `^${city}$`, $options: "i" };
    if (experience) {
      const mapped = experienceMapping[experience];
      if (mapped?.length) baseMatch["Experience Range"] = { $in: mapped };
    }

    const pipeline = [];
    const totalPipeline = [];

    const addComputed = (arr) => {
      // Build numeric lower/upper once, used by sort + filtering
      if (salaryOrder === "ascending" || salaryOrder === "descending") {
        arr.push({
          $addFields: {
            salary_lower_numeric: {
              $switch: {
                branches: [
                  { case: { $isNumber: "$salary_lower" }, then: "$salary_lower" },
                  {
                    case: {
                      $and: [
                        { $eq: [{ $type: "$salary_lower" }, "string"] },
                        { $regexMatch: { input: "$salary_lower", regex: /^[0-9]+(\.[0-9]+)?$/ } }
                      ]
                    },
                    then: { $toDouble: "$salary_lower" }
                  }
                ],
                default: null
              }
            },
            salary_upper_numeric: {
              $switch: {
                branches: [
                  { case: { $isNumber: "$salary_upper" }, then: "$salary_upper" },
                  {
                    case: {
                      $and: [
                        { $eq: [{ $type: "$salary_upper" }, "string"] },
                        { $regexMatch: { input: "$salary_upper", regex: /^[0-9]+(\.[0-9]+)?$/ } }
                      ]
                    },
                    then: { $toDouble: "$salary_upper" }
                  }
                ],
                default: null
              }
            },
            // STRICT format flag: "pkr. <num> - <num>/month"
            salary_format_valid: {
              $regexMatch: {
                input: { $ifNull: ["$Salary", ""] },
                // require spaces around dash; allow 1+ digits on each side; allow commas
                regex: /^pkr\.\s*\d+[\d,]*\s-\s\d+[\d,]*\/month$/i
              }
            }
          }
        });
      }

      if (sortOrder === "newest" || sortOrder === "oldest") {
        arr.push({
          $addFields: {
            parsedDate: {
              $cond: [
                { $eq: [{ $type: "$Posting Date" }, "date"] },
                "$Posting Date",
                {
                  $dateFromString: {
                    dateString: "$Posting Date",
                    format: "%d/%m/%Y",
                    onError: null,
                    onNull: null
                  }
                }
              ]
            }
          }
        });
      }
    };

    addComputed(pipeline);
    addComputed(totalPipeline);

    // Build final match with computed-constraints
    const matchConditions = { ...baseMatch };

    // When salary sort is used, keep only rows with numeric salary AND the strict string format
    if (salaryOrder === "ascending" || salaryOrder === "descending") {
      matchConditions.$and = [
        {
          $or: [
            { salary_lower_numeric: { $ne: null } },
            { salary_upper_numeric: { $ne: null } },
          ]
        },
        { salary_format_valid: true }
      ];
    }

    if (sortOrder === "newest" || sortOrder === "oldest") {
      matchConditions.parsedDate = { $ne: null };
    }

    pipeline.push({ $match: matchConditions });

    const sortStage = {};
    if (salaryOrder === "ascending" || salaryOrder === "descending") {
      // Prefer sorting by lower if available; fall back to upper
      sortStage.salary_lower_numeric = salaryOrder === "ascending" ? 1 : -1;
      sortStage.salary_upper_numeric = salaryOrder === "ascending" ? 1 : -1;
    }
    if (sortOrder === "newest" || sortOrder === "oldest") {
      sortStage.parsedDate = sortOrder === "newest" ? -1 : 1;
    }
    if (Object.keys(sortStage).length) pipeline.push({ $sort: sortStage });

    pipeline.push({ $skip: skip }, { $limit: limit });

    const jobs = await Job.aggregate(pipeline);

    // total with SAME constraints (so pagination is correct)
    totalPipeline.push({ $match: matchConditions }, { $count: "count" });
    const totalResult = await Job.aggregate(totalPipeline);
    const total = totalResult[0]?.count || 0;

    return new Response(JSON.stringify({
      jobs,
      total,
      totalPages: Math.ceil(total / limit)
    }), { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    return new Response(JSON.stringify({ message: "Error fetching jobs", error: error.message }), { status: 500 });
  }
}
