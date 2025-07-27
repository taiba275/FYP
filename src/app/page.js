import HomeClient from "./HomeClient";
import { connectDB } from "../library/mongodb";
import Job from "./models/Job";

async function getJobs(category = '', page = 1, limit = 20) {
  await connectDB();

  const skip = (page - 1) * limit;
  const query = {};

  if (category) {
    query.Industry = { $regex: category, $options: 'i' };
  }

  const jobs = await Job.find(query).skip(skip).limit(limit).lean();
  return jobs.map(job => ({ ...job, _id: job._id.toString() }));
}

export default async function HomePage(props) {
  const searchParams = await props.searchParams; // ✅ FIX: await the Promise
  const category = searchParams?.category || "";
  const initialJobs = await getJobs(category, 1, 20);

  return <HomeClient initialJobs={initialJobs} initialCategory={category} />;
}
