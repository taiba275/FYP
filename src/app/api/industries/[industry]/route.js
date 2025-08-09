import { NextResponse } from 'next/server';
import { connectDB } from '@/library/mongodb';
import Job from '@/app/models/Job';

// Build a regex that matches an industry token within slash/comma separated list
function tokenRegex(industry) {
  // Escape regex chars in user-provided industry
  const escaped = industry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Matches start-of-string OR delimiter, then token (trimmed), then delimiter OR end
  // Delimiters are comma or slash, possibly with spaces around them
  return new RegExp(`(^|[\\s]*[,/][\\s]*)${escaped}([\\s]*[,/][\\s]*|$)`, 'i');
}

export async function GET(req, context) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);

    const params = await context.params; // ⬅ await here
    const rawIndustry = decodeURIComponent(params.industry || '').trim();
    if (!rawIndustry) {
      return NextResponse.json({ error: 'Industry is required' }, { status: 400 });
    }

    const rx = tokenRegex(rawIndustry);

    // Filter: Industry field contains the selected token among comma/slash-separated values
    const filter = { Industry: { $regex: rx } };

    const [total, jobs] = await Promise.all([
      Job.countDocuments(filter),
      Job.find(filter, {
        Title: 1,
        Company: 1,
        'Job Location': 1,
        City: 1,
        Salary: 1,
        salary_lower: 1,
        salary_upper: 1,
        JobType: 1,
        PostingDate: 1,
        ApplyBefore: 1,
        JobURL: 1,
        ExtractedRole: 1,
        Industry: 1,
      })
        .sort({ PostingDate: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      industry: rawIndustry,
      total,
      page,
      limit,
      jobs,
    });
  } catch (err) {
    console.error('Error fetching jobs by industry:', err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
