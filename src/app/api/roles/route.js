import { NextResponse } from 'next/server';
import { connectDB } from '@/library/mongodb';
import Job from '@/app/models/Job';

export async function GET() {
  try {
    await connectDB();

    const rows = await Job.aggregate([
      {
        $group: {
          _id: {
            $toLower: { $trim: { input: { $ifNull: ["$ExtractedRole", ""] } } },
          },
          rawAny: { $first: "$ExtractedRole" },
        },
      },
      { $match: { _id: { $ne: "" } } },
    ]);

    const excluded = new Set(['not mentioned','n/a','unknown','none','null','unspecified','other']);

    const values = rows
      .map(r => (r.rawAny ?? r._id) + "")
      .map(s => s.trim())
      .filter(s => s && !excluded.has(s.toLowerCase()))
      .map(s => s.charAt(0).toUpperCase() + s.slice(1));

    const unique = [...new Set(values)].sort((a,b)=>a.localeCompare(b));

    return NextResponse.json({ roles: unique });
  } catch (err) {
    console.error('Error fetching roles:', err);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}
