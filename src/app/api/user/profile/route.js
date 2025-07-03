import { NextResponse } from "next/server";
import { connectDB } from "../../../../library/mongodb";
import User from "../../../models/User";
import { getUserFromRequest } from "../../../../utils/auth"; // adjust path if needed

// Helper: validate profile data on update
function validateProfileData(data) {
  const requiredFields = [
    "username", "fullname", "dob", "gender", "phone", "education", "status",
    "location", "address", "salary", "interest", "skills"
  ];
  for (let field of requiredFields) {
    if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
      return `${field[0].toUpperCase() + field.slice(1)} is required`;
    }
  }

  // Education array validation
  if (!Array.isArray(data.education) || data.education.length === 0) {
    return "At least one education entry is required";
  }
  for (let [i, edu] of data.education.entries()) {
    if (!edu.level) return `Education level is required (entry #${i + 1})`;
    if (!edu.field) return `Education field is required (entry #${i + 1})`;
  }

  // Phone (basic length/number check)
  if (typeof data.phone === "string" && data.phone.replace(/\D/g, '').length < 10) {
    return "Phone number is incomplete or invalid";
  }

  // Add any further checks as needed
  return null;
}

export async function GET(req) {
  await connectDB();
  const userInfo = getUserFromRequest(req);
  if (!userInfo) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const user = await User.findOne({ email: userInfo.email }).select("-password -otp -otpExpiry");
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Convert Mongoose document to plain JS object
  const userObj = user.toObject();

  // Convert Date fields if necessary (dob) to ISO string for input compatibility
  if(userObj.dob) {
    userObj.dob = userObj.dob.toISOString().split("T")[0];
  }

  return NextResponse.json({ user: userObj }, { status: 200 });
}


export async function PUT(req) {
  await connectDB();
  const userInfo = getUserFromRequest(req);
  if (!userInfo) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const data = await req.json();

  // Ensure education is an array of objects before validation and saving
  if (data.education && !Array.isArray(data.education)) {
    try {
      // If education is a JSON string, parse it
      data.education = JSON.parse(data.education);
    } catch {
      // If parsing fails (education is a plain string), convert to array with default field
      data.education = [{ level: data.education, field: "" }];
    }
  }

  const validationError = validateProfileData(data);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const allowedFields = [
      "username",
      "fullname",
      "dob",
      "gender",
      "phone",
      "education",
      "status",
      "location",
      "address",
      "salary",
      "interest",
      "skills",
      "linkedin",
      "photo",
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    const user = await User.findOneAndUpdate(
      { email: userInfo.email },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpiry");

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errorMsg = Object.values(err.errors).map(e => e.message).join(", ");
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update", error: err.message }, { status: 500 });
  }
}
