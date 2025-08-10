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
      Industry: 1,
      FunctionalArea: 1,
      ['Functional Area']: 1,
      Company: 1,
      _id: 0,
    });

    const roleSet = new Set();
    const jobTypes = new Set();
    const citiesSet = new Set();
    const industriesSet = new Set();
    const functionsSet = new Set();
    const companiesSet = new Set();

    jobs.forEach((job) => {
      // roles
      if (job.ExtractedRole) {
        const role = job.ExtractedRole.trim().toLowerCase();
        if (role) roleSet.add(role);
      }
      // job types
      if (job.JobType) jobTypes.add(job.JobType.trim());
      // cities (comma separated)
      if (job.City) {
        job.City.split(',').forEach((c) => {
          const cleaned = c.trim().toLowerCase();
          if (cleaned) citiesSet.add(cleaned);
        });
      }
      // industry
      if (job.Industry) {
        const s = job.Industry.trim().toLowerCase();
        if (s) industriesSet.add(s);
      }
      // function (two possible fields)
      const fa = (job.FunctionalArea || job['Functional Area'] || '').trim().toLowerCase();
      if (fa) functionsSet.add(fa);
      // company
      if (job.Company) {
        const s = job.Company.trim();
        if (s) companiesSet.add(s);
      }
    });

    const toTitle = (s) =>
      s.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        .trim();

    const extractedRoles = [...roleSet].map(toTitle).sort();
    const cities = [...new Set([...citiesSet].map(toTitle))].sort();
    const industries = [...new Set([...industriesSet].map(toTitle))].sort();
    const functions = [...new Set([...functionsSet].map(toTitle))].sort();
    const companies = [...new Set([...companiesSet])].sort();

    return NextResponse.json({
      extractedRoles,
      industries,
      functions,
      companies,
      jobTypes: [...jobTypes].sort(),
      cities,
    });
  } catch (error) {
    console.error('Error loading filters:', error);
    return NextResponse.json({ error: 'Failed to fetch filter data' }, { status: 500 });
  }
}
