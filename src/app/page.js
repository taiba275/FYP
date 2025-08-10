// import HomeClient from "./HomeClient";
// import { connectDB } from "../library/mongodb";
// import Job from "./models/Job";

// async function getJobs(category = '', page = 1, limit = 20) {
//   await connectDB();

//   const skip = (page - 1) * limit;
//   const query = {};

//   if (category) {
//     query.Industry = { $regex: category, $options: 'i' };
//   }

//   const jobs = await Job.find(query).skip(skip).limit(limit).lean();
//   return jobs.map(job => ({ ...job, _id: job._id.toString() }));
// }

// export default async function HomePage(props) {
//   const searchParams = await props.searchParams; // ✅ FIX: await the Promise
//   const category = searchParams?.category || "";
//   const initialJobs = await getJobs(category, 1, 20);

//   return <HomeClient initialJobs={initialJobs} initialCategory={category} />;
// }

import HomeClient from "./HomeClient";
import { connectDB } from "../library/mongodb";
import Job from "./models/Job";

async function getJobs({
  industry = "",
  func = "",
  company = "",
  role = "",
  page = 1,
  limit = 20,
}) {
  await connectDB();
  const skip = (page - 1) * limit;

  const query = {};
  if (industry) query["Industry"] = { $regex: `^${industry}$`, $options: "i" };
  if (func) query["Functional Area"] = { $regex: `^${func}$`, $options: "i" };
  if (company) query["Company"] = { $regex: `^${company}$`, $options: "i" };
  if (role) query["ExtractedRole"] = { $regex: `^${role}$`, $options: "i" };

  const jobs = await Job.find(query).skip(skip).limit(limit).lean();
  return jobs.map((job) => ({ ...job, _id: job._id.toString() }));
}

export default async function HomePage(props) {
  const searchParams = await props.searchParams;

  const industry = (searchParams?.industry || "").trim();
  const func = (searchParams?.function || "").trim();
  const company = (searchParams?.company || "").trim();
  const role = (searchParams?.role || "").trim();

  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams?.limit || "20", 10)));

  // Use whichever facet was provided for initialCategory (keeps your Filter happy)
  const initialCategory = industry || func || company || role || "";

  const initialJobs = await getJobs({
    industry,
    func,
    company,
    role,
    page,
    limit,
  });

  return (
    <HomeClient
      initialJobs={initialJobs}
      initialCategory={initialCategory}
    />
  );
}
