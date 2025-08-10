// src/app/api/jobs-by-role/route.js
import { NextResponse } from "next/server";
const BACKEND_BASE = process.env.BACKEND_BASE || "http://35.227.145.87:8000";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role  = searchParams.get("role") || "";
    const page  = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!role) {
      return NextResponse.json(
        { detail: "Role parameter is required" },
        { status: 400 }
      );
    }

    // Fetch ALL jobs from backend
    const upstream = await fetch(
      `${BACKEND_BASE}/jobs-by-role?role=${encodeURIComponent(role)}`,
      { cache: "no-store" }
    );

    const json = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { detail: json?.detail || `Error ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const allJobs = Array.isArray(json.jobs) ? json.jobs : [];

    // Slice for the requested page
    const start = (page - 1) * limit;
    const paginatedJobs = allJobs.slice(start, start + limit);

    return NextResponse.json({
      jobs: paginatedJobs,
      total: allJobs.length,
      page,
      limit,
    });
  } catch (err) {
    console.error("API /jobs-by-role error:", err);
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
