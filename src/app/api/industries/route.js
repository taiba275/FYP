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

    const excluded = new Set([
      'not mentioned',
      'n/a',
      'unknown',
      'none',
      'null',
      'unspecified',
      'other',
    ]);

    // Flatten, clean, filter, and capitalize
    const splitIndustries = rawIndustries.flatMap((entry) =>
      entry
        .split(/[,/]/)
        .map((item) => item.trim())
        .filter(
          (item) =>
            item.length > 0 &&
            !excluded.has(item.toLowerCase())
        )
        .map(
          (item) =>
            item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
        )
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
