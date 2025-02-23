import { mongoose } from "../../../../library/mongodb";

const JobSchema = new mongoose.Schema({
  // Add your job fields here
}, { collection: 'RozeeFinal' });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

export async function GET(req, { params }) {
  try {
    if (!params?.id) {
      return Response.json({ message: "Invalid Job ID" }, { status: 400 });
    }

    const job = await Job.findById(params.id).lean();

    if (!job) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    return Response.json(job, { status: 200 });
  } catch (error) {
    console.error("Error fetching job:", error);
    return Response.json({ message: "Error fetching job", error: error.message }, { status: 500 });
  }
}
