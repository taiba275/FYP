import { mongoose } from "../../../../library/mongodb";

const JobSchema = new mongoose.Schema({
  // Add your job fields here
}, { collection: 'RozeeFinal' });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

export async function GET(req, context) {
  // context.params is a Promise, await it
  const params = await context.params;

  if (!params?.id) {
    return new Response(JSON.stringify({ message: "Invalid Job ID" }), { status: 400 });
  }

  const job = await Job.findById(params.id).lean();

  if (!job) {
    return new Response(JSON.stringify({ message: "Job not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(job), { status: 200 });
}
