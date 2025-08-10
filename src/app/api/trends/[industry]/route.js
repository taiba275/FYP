// Ensure Node runtime (so AbortController works predictably)
export const runtime = "nodejs";

import { NextResponse } from "next/server";

const BASE = process.env.TRENDS_API_BASE; // e.g. http://35.227.145.87:8000

export async function GET(_req, { params }) {
  try {
    const industryRaw = params?.industry ?? "All Industries";
    const industry = decodeURIComponent(industryRaw);

    if (!BASE) {
      return NextResponse.json(
        { detail: "Server misconfig: TRENDS_API_BASE is not set" },
        { status: 500 }
      );
    }

    // Abort if the upstream hangs (keep under your 40s UI timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    const url = `${BASE.replace(/\/$/, "")}/trends/${encodeURIComponent(industry)}`;
    const upstream = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const json = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { detail: json?.detail || `Upstream error ${upstream.status}` },
        { status: upstream.status }
      );
    }

    // Pass through upstream JSON unchanged
    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "Upstream request timed out"
        : err?.message || "Failed to fetch trends";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
