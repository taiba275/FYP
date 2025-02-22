import clientPromise from "../../../../library/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    if (!params || !params.id) {
      return new Response(JSON.stringify({ message: "Invalid Job ID" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("test"); // Ensure correct database name

    const job = await db.collection("RozeeFinal").findOne({ _id: ObjectId.createFromHexString(params.id) });

    if (!job) {
      return new Response(JSON.stringify({ message: "Job not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(job), { status: 200 });
  } catch (error) {
    console.error("Error fetching job:", error);
    return new Response(JSON.stringify({ message: "Error fetching job", error: error.message }), { status: 500 });
  }
}
