import { mongoose } from "../../../../library/mongodb";

const JobSchema = new mongoose.Schema({
  // Add your job fields here
}, { collection: 'Combined_Dataset' });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

export async function GET(req, { params }) {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ message: "Invalid Job ID" }), { status: 400 });
  }

  const job = await Job.findById(id).lean();

  if (!job) {
    return new Response(JSON.stringify({ message: "Job not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(job), { status: 200 });
}
