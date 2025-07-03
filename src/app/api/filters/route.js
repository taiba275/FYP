import { NextResponse } from 'next/server';
import { connectDB } from '@/library/mongodb';
import Job from '@/app/models/Job';

export async function GET() {
  try {
    await connectDB();

    const jobs = await Job.find({}, {
      Industry: 1,
      JobType: 1,
      City: 1,
      _id: 0,
    });

    const industrySet = new Set();
    const jobTypes = new Set();
    const cities = new Set();

    jobs.forEach((job) => {
      // ✅ SPLIT multi-industry strings like "Advertising, Design"
      if (job.Industry) {
        job.Industry.split(',').forEach((raw) => {
          const cleaned = raw.trim().toLowerCase();
          if (cleaned) industrySet.add(cleaned);
        });
      }

      if (job.JobType) {
        jobTypes.add(job.JobType.trim());
      }

      if (job.City) {
        job.City.split(',').forEach((c) => cities.add(c.trim()));
      }
    });

    // ✅ Capitalize first letter of each word in industries
    const industries = [...industrySet]
      .map((industry) =>
        industry
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      )
      .sort();

    return NextResponse.json({
      industries,
      jobTypes: [...jobTypes].sort(),
      cities: [...cities].sort(),
    });
  } catch (error) {
    console.error('Error loading filters:', error);
    return NextResponse.json({ error: 'Failed to fetch filter data' }, { status: 500 });
  }
}
