import { connectDB } from '../../../../library/mongodb';
import Job from '../../../models/Job'; // your mongoose model
import { NextResponse } from 'next/server';

export async function GET(req, context) {
  try {
    const { params } = await context; // <-- await this
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Invalid Job ID" }, { status: 400 });
    }

    await connectDB();
    const job = await Job.findById(id).lean();

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
