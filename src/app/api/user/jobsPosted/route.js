// C:\Projects\FYP\src\app\api\user\jobsPosted\route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import User from "../../../models/User";
import { getUserFromRequest } from "../../../../utils/auth";

export async function GET(req) {
  await connectDB();

  const userInfo = getUserFromRequest(req);
  if (!userInfo) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const user = await User.findOne({ email: userInfo.email }).populate("jobsPosted");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ jobsPosted: user.jobsPosted }, { status: 200 });
}
