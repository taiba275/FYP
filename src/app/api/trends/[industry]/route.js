export const runtime = "nodejs";
import { NextResponse } from "next/server";

const BASE = "http://35.227.145.87:8000"; // your backend HTTP address

export async function GET(req, { params }) {
  try {
    const industry = decodeURIComponent(params.industry || "All Industries");

    const upstream = await fetch(`${BASE}/trends/${encodeURIComponent(industry)}`, {
      cache: "no-store",
    });

    const json = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { detail: json?.detail || `Error ${upstream.status}` },
        { status: upstream.status }
      );
    }

    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
