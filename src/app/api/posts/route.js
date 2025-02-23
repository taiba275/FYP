import { connectDB } from "../../../library/mongodb";
import Job from '../../models/Job';

export async function GET() {
  try {
    await connectDB();
    const jobs = await Job.find({}).lean();
    return Response.json(jobs, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    return Response.json({ message: "Error fetching jobs", error: error.message }, { status: 500 });
  }
}
