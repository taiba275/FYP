import { NextResponse } from 'next/server';
import { connectDB } from '@/library/mongodb';
import Job from '@/app/models/Job';

export async function GET() {
  try {
    await connectDB();

    const jobs = await Job.find({}, {
      ExtractedRole: 1,
      JobType: 1,
      City: 1,
      _id: 0,
    });

    const roleSet = new Set();
    const jobTypes = new Set();
    const citiesSet = new Set();

    jobs.forEach((job) => {
      // ✅ ExtractedRole
      if (job.ExtractedRole) {
        const role = job.ExtractedRole.trim().toLowerCase();
        if (role) roleSet.add(role);
      }

      // ✅ Collect job types
      if (job.JobType) {
        jobTypes.add(job.JobType.trim());
      }

      // ✅ Collect cities (handling comma-separated values)
      if (job.City) {
        job.City.split(',').forEach((c) => {
          const cleaned = c.trim().toLowerCase();
          if (cleaned) citiesSet.add(cleaned);
        });
      }
    });

    // ✅ Normalize and sort categories
    const extractedRoles = [...roleSet]
      .map(role =>
        role
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      )
      .sort();

    // ✅ Normalize, deduplicate, and sort cities
    const cities = [...citiesSet]
      .map(city =>
        city
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .trim()
      );

    const uniqueCities = [...new Set(cities)].sort();

    return NextResponse.json({
      extractedRoles,
      jobTypes: [...jobTypes].sort(),
      cities: uniqueCities,
    });

  } catch (error) {
    console.error('Error loading filters:', error);
    return NextResponse.json({ error: 'Failed to fetch filter data' }, { status: 500 });
  }
}
