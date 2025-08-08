import { NextResponse } from "next/server";
import { connectDB } from "@/library/mongodb";
import Job from "@/app/models/Job";

export const dynamic = "force-dynamic"; // never cache

export async function GET() {
  try {
    await connectDB();

    // total = dataset + posted (both are in the same collection)
    const [total, posted, dataset] = await Promise.all([
      Job.countDocuments({}),
      Job.countDocuments({ userId: { $exists: true, $ne: null } }),
      Job.countDocuments({
        $or: [{ userId: { $exists: false } }, { userId: null }],
      }),
    ]);

    return NextResponse.json({ total, posted, dataset });
  } catch (err) {
    console.error("GET /api/jobs/count failed:", err);
    return NextResponse.json({ total: 0, posted: 0, dataset: 0 }, { status: 500 });
  }
}
