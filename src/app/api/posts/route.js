import clientPromise from "../../../library/mongodb";

export async function GET() {
  try {
    console.log("✅ Connecting to MongoDB Atlas...");
    const client = await clientPromise;
    const db = client.db("test");  // Ensure correct database name
    const jobsCollection = db.collection("RozeeFinal");  // Collection name

    const jobs = await jobsCollection.find({}).toArray();

    console.log("✅ Jobs fetched:", jobs.length);
    return Response.json(jobs, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    return Response.json({ message: "Error fetching jobs", error: error.message }, { status: 500 });
  }
}
