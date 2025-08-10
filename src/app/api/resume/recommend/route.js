export const runtime = "nodejs";
import { NextResponse } from "next/server";

const BASE = "http://35.227.145.87:8001";

export async function POST(req) {
  try {
    const payload = await req.text();

    const upstream = await fetch(`${BASE}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
