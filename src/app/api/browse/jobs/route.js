export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/library/mongodb";
import Job from "@/app/models/Job";

const FIELD_BY_FACET = {
  industry: "Industry",
  function: "Functional Area",
  company: "Company",
  role: "ExtractedRole",
};

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Normalize for regex: collapse spaces to \s+, ignore leading/trailing spaces, case-insensitive
function makeLooseExactRegex(value) {
  // escape punctuation, then convert spaces in the value to flexible \s+
  const escaped = escapeRegExp(value.trim());
  const flexibleSpaces = escaped.replace(/\s+/g, "\\s+");
  return new RegExp(`^\\s*${flexibleSpaces}\\s*$`, "i");
}

// Even looser: ignore common punctuation differences like "." and ","
function makePunctuationAgnosticRegex(value) {
  // Replace any run of non-word (excluding space) with a flexible class
  // e.g., "Pvt. Ltd" -> "Pvt\\W*\\s+Ltd"
  const base = value.trim().replace(/([.*+?^${}()|[\]\\])/g, "\\$1"); // escape regex metachars
  const punctFlex = base.replace(/[^\w\s]+/g, "\\W*").replace(/\s+/g, "\\s+");
  return new RegExp(`^\\s*${punctFlex}\\s*$`, "i");
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const facet = (searchParams.get("facet") || "").toLowerCase();
    const valueRaw = (searchParams.get("value") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const field = FIELD_BY_FACET[facet];
    if (!field || !valueRaw) {
      return NextResponse.json(
        { success: false, message: "Invalid facet or value" },
        { status: 400 }
      );
    }

    let filter;

    if (facet === "company") {
      // Be extra forgiving for company names
      const r1 = makeLooseExactRegex(valueRaw);
      const r2 = makePunctuationAgnosticRegex(valueRaw);
      filter = {
        $or: [
          { [field]: { $regex: r1 } },
          { [field]: { $regex: r2 } },
          // fallback: strict trimmed-equality via case-insensitive regex
          { [field]: { $regex: new RegExp(`^\\s*${escapeRegExp(valueRaw)}\\s*$`, "i") } },
        ],
      };
    } else {
      // Existing behavior for role / function / industry
      filter = {
        [field]: {
          $regex: new RegExp(`^\\s*${escapeRegExp(valueRaw)}\\s*$`, "i"),
        },
      };
    }

    const skip = (page - 1) * limit;

    const [total, jobs] = await Promise.all([
      Job.countDocuments(filter),
      Job.find(filter)
        .sort({ "Posting Date": -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({ success: true, page, limit, total, jobs });
  } catch (err) {
    console.error("browse/jobs error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
