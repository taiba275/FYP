import { NextResponse } from "next/server";

const BACKEND_BASE = process.env.BACKEND_BASE || "http://35.227.145.87:8000";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "";

    if (!role) {
      return NextResponse.json(
        { detail: "Role parameter is required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    console.error("API /jobs-by-role error:", err);
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
