import { connectDB } from "../../../../library/mongodb";
import Job from "../../../models/Job";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret";

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.id;

    const jobs = await Job.find({ user: userId }).sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });

  } catch (err) {
    console.error("❌ Error fetching posted jobs:", err);
    return NextResponse.json(
      { message: "Failed to fetch posted jobs", error: err.message },
      { status: 500 }
    );
  }
}
