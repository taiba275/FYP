import { NextResponse } from 'next/server';
import { connectDB } from '@/library/mongodb';
import Job from '@/app/models/Job';

export async function GET() {
  try {
    await connectDB();

    const jobs = await Job.find({}, { Industry: 1, _id: 0 });

    const rawIndustries = jobs
      .map((job) => job.Industry)
      .filter(Boolean);

    // Flatten and clean industries
    const splitIndustries = rawIndustries.flatMap((entry) =>
      entry
        .split(/[,/]/) // split on comma or slash
        .map((item) => item.trim()) // trim whitespace
        .filter((item) => item.length > 0)
    );

    // Deduplicate and sort
    const uniqueIndustries = [...new Set(splitIndustries)].sort((a, b) =>
      a.localeCompare(b)
    );

    return NextResponse.json({ industries: uniqueIndustries });
  } catch (error) {
    console.error('Error fetching industries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    );
  }
}
