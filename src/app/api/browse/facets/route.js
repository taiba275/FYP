export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/library/mongodb";
import Job from "@/app/models/Job";

async function distinctWithCounts(field) {
  const pipeline = [
    {
      $group: {
        _id: {
          $toLower: {
            $trim: { input: { $ifNull: [`$${field}`, ""] } }
          }
        },
        rawAny: { $first: `$${field}` },
        count: { $sum: 1 }
      }
    },
    { $match: { _id: { $ne: "" } } },
    { $sort: { count: -1, _id: 1 } }
  ];
  const rows = await Job.aggregate(pipeline).allowDiskUse(true);
  return rows.map(r => ({
    value: (r.rawAny && String(r.rawAny).trim()) || r._id,
    count: r.count,
  }));
}

export async function GET() {
  try {
    await connectDB();

    const [industries, functions, companies, roles] = await Promise.all([
      distinctWithCounts("Industry"),
      distinctWithCounts("Functional Area"),
      distinctWithCounts("Company"),
      distinctWithCounts("ExtractedRole"),
    ]);

    return NextResponse.json({
      success: true,
      facets: { industries, functions, companies, roles },
    });
  } catch (err) {
    console.error("facets error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load facets" },
      { status: 500 }
    );
  }
}
