export const runtime = "nodejs";
import { NextResponse } from "next/server";

const BASE = "http://35.227.145.87:8001";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const upstream = await fetch(`${BASE}/extract-resume`, {
      method: "POST",
      body: formData,
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
