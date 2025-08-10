export const runtime = "nodejs";

export async function POST(req) {
  try {
    const payload = await req.json();

    // Call your backend API securely from the server side
    const backendRes = await fetch("http://35.227.145.87:8001/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await backendRes.text();

    return new Response(text, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error proxying to backend:", err);
    return new Response(JSON.stringify({ error: "Proxy request failed" }), { status: 500 });
  }
}
