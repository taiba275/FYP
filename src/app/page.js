import { connectDB } from '../library/mongodb';
import Job from './models/Job';
import HomeClient from './HomeClient';

// Server-side revalidation
export const revalidate = 3600; // 1 hour

async function getJobs() {
  await connectDB();
  const jobs = await Job.find({}).lean();
  
  // Convert MongoDB documents to plain objects
  return JSON.parse(JSON.stringify(jobs.map(job => ({
    ...job,
    _id: job._id.toString(), // Convert ObjectId to string
    // Keep dates as they are since they're already strings
    "Posting Date": job["Posting Date"] || null,
    "Apply Before": job["Apply Before"] || null
  }))));
}

export default async function HomePage() {
  const initialJobs = await getJobs();
  
  return <HomeClient initialJobs={initialJobs} />;
}
