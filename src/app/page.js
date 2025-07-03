import { connectDB } from '../library/mongodb';
import Job from './models/Job';
import HomeClient from './HomeClient';

export const revalidate = 3600; // 1 hour

// 🔁 Accept optional category filter from query
async function getJobs(category = '') {
  await connectDB();

  const query = {};

  // Allow partial and case-insensitive match
  if (category) {
    query.Industry = { $regex: category, $options: 'i' };
  }

  const jobs = await Job.find(query).lean();

  return JSON.parse(JSON.stringify(jobs.map(job => ({
    ...job,
    _id: job._id.toString(),
  }))));
}

export default async function HomePage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const category = searchParams?.category || "";

  const initialJobs = await getJobs(category);

  return <HomeClient initialJobs={initialJobs} initialCategory={category} />;
}

