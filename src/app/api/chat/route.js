// Ensure Node runtime (avoids Edge crypto quirks)
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// const CHATBOT_BASE = process.env.BACKEND_CHATBOT_API; // <-- server-only

// ---------- HELPERS ----------
function isFollowUp(message) {
  const keywords = [
    "prepare",
    "salary",
    "qualification",
    "apply",
    "experience",
    "remote",
    "perks",
    "benefits",
    "skills",
    "detail",
    "more",
  ];
  return keywords.some((k) => (message || "").toLowerCase().includes(k));
}

function isGreeting(message) {
  const normalized = (message || "").trim().toLowerCase();
  return ["hi", "hello", "hey", "salam", "asalam", "assalamu alaikum"].includes(
    normalized
  );
}

function referencedMarkdown(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) return "";
  const items = jobs
    .slice(0, 5)
    .map((j) => {
      const title = j?.title || "Untitled Role";
      const company = j?.company ? ` at ${j.company}` : "";
      const url = j?.url || "#";
      return `- ${title}${company} — [Apply](${url})`;
    })
    .join("\n");
  return `\n> **Jobs Referenced:**\n${items}`;
}

function buildJobContextFromList(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0)
    return "No relevant job listings found.";
  return jobs
    .slice(0, 5)
    .map(
      (job, i) => `
Job ${i + 1}:
- **Title:** ${job.title || ""}
- **Company:** ${job.company || ""}
- **Description:** ${job.summary || ""}
- **Salary:** ${job.salary || "Not specified"}
- **Apply URL:** [Apply Here](${job.url || "#"})`
    )
    .join("\n\n");
}

function strictBlock() {
  return `
Your task is to respond to the user's query using only the above job listings. Follow these strict instructions:

1. If the user asks for job listings:
   - Return each job with:
     - A short, clear **summary of responsibilities**
     - The **key skills required**
     - The **salary** (if available)
     - A **clickable "Apply Here" link** using markdown: [Apply Here](job.url)

2. If the user asks for interview questions related to any job:
   - Provide a list of **realistic, role-specific interview questions** (technical + behavioral).
   - Include **model answers or best answering strategies**.
   - Suggest **online resources to prepare**.
   - Organize the learning into a **step-by-step preparation flow**.

3. For follow-ups like "salary", "remote", or "skills":
   - Only use data from the listed jobs above. No external assumptions.

4. Never invent or refer to jobs not listed above.
5. Use **bullets or numbers** for clarity.
6. All links must be **clickable markdown**, e.g., [Apply Here](job.url).

Be concise, helpful, and accurate.`.trim();
}

// Generate an ID without importing Node crypto (works on Node runtime too)
const makeId = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

// ---------- GET ----------
export async function GET() {
  try {
    //  if (!CHATBOT_BASE) {
    //   return NextResponse.json({ error: "BACKEND_CHATBOT_API not set" }, { status: 500 });
    // }

    const jar = await cookies();
    let guest_id = jar.get("guest_id")?.value;

    // Build response so we can set cookie if needed
    const setCookieAndReturn = async (payload) => {
      const res = NextResponse.json(payload);
      if (!guest_id) {
        guest_id = makeId();
        res.cookies.set("guest_id", guest_id, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      }
      return res;
    };

    const sessionId = `guest:${guest_id ?? "pending"}`;

    const historyRes = await fetch(
    `http://35.227.145.87:5010/chat/history/${encodeURIComponent(sessionId)}?minutes=60`
    );
    const history = historyRes.ok ? await historyRes.json() : [];

    const jobsRes = await fetch(
      `http://35.227.145.87:5010/last-jobs/${encodeURIComponent(sessionId)}`
    );
    const jobsData = jobsRes.ok ? await jobsRes.json() : { jobs: [] };

    return setCookieAndReturn({
      history,
      previousResults: jobsData?.jobs || [],
      session_id: sessionId,
    });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    return NextResponse.json({ history: [], previousResults: [] });
  }
}

// ---------- POST ----------
export async function POST(req) {
  try {
  //   if (!CHATBOT_BASE) {
  //     return NextResponse.json({ error: "BACKEND_CHATBOT_API not set" }, { status: 500 });
  //   }

    const { messages, previousResults = [], user_id } = await req.json();

    const jar = await cookies();
    let guest_id = jar.get("guest_id")?.value;

    const ensureResponse = (payload) => {
      const res = NextResponse.json(payload);
      if (!guest_id) {
        guest_id = makeId();
        res.cookies.set("guest_id", guest_id, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
      return res;
    };

    const userMessage = messages?.[messages.length - 1]?.content || "";
    const sessionId = user_id ? String(user_id) : `guest:${guest_id ?? "pending"}`;

    if (!userMessage.trim()) {
      return ensureResponse({
        choices: [
          {
            message: {
              role: "assistant",
              content:
                "Can you please clarify your request? I'm here to help with job listings or interview tips.",
            },
          },
        ],
        results: [],
        session_id: sessionId,
      });
    }

    if (isGreeting(userMessage)) {
      return ensureResponse({
        choices: [
          {
            message: {
              role: "assistant",
              content:
                "Hello! How can I assist you with job recommendations today?",
            },
          },
        ],
        results: [],
        session_id: sessionId,
      });
    }

    // ---------- FOLLOW-UP (NO FRESH SEARCH) ----------
    if (isFollowUp(userMessage) && previousResults.length > 0) {
      const detailMatch = userMessage.match(/job\s+(\d+)/i);
      if (detailMatch) {
        const jobIndex = parseInt(detailMatch[1], 10);
        const detailsRes = await fetch(
          `http://35.227.145.87:5010/job-details/${jobIndex}?user_id=${encodeURIComponent(sessionId)}`
        );
        const detailsData = await detailsRes.json();
        const md =
          (detailsData?.display_markdown || "No details found.") +
          referencedMarkdown(previousResults);
        return ensureResponse({
          choices: [{ message: { role: "assistant", content: md } }],
          results: previousResults,
          session_id: sessionId,
        });
      }

      const jobContext = buildJobContextFromList(previousResults);
      const prompt = `
The user asked: "${userMessage}"

Below are the relevant job listings to use for answering:

${jobContext}

${strictBlock()}
`.trim();

      const llmRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "anthropic/claude-3-haiku",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
          }),
        }
      );

      const llmData = await llmRes.json();
      const llmText =
        llmData?.choices?.[0]?.message?.content ||
        "Here are the roles from the list above.";
      const md = llmText + referencedMarkdown(previousResults);
      return ensureResponse({
        choices: [{ message: { role: "assistant", content: md } }],
        results: previousResults,
        session_id: sessionId,
      });
    }

    // ---------- INITIAL SEARCH (FAISS)
    const faissRes = await fetch(`http://35.227.145.87:5010/retrieve-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, user_id: sessionId }),
    });

    if (!faissRes.ok) {
      const errText = await faissRes.text();
      console.error("retrieve-jobs failed:", faissRes.status, errText);
      return ensureResponse({
        choices: [
          {
            message: {
              role: "assistant",
              content:
                "I couldn’t retrieve jobs right now. Please try again in a moment.",
            },
          },
        ],
        results: [],
        session_id: sessionId,
      });
    }

    const faissData = await faissRes.json();
    const jobs = Array.isArray(faissData?.results) ? faissData.results : [];
    const md = faissData.display_markdown || "Here are the top matches.";

    return ensureResponse({
      choices: [{ message: { role: "assistant", content: md } }],
      results: jobs.slice(0, 5),
      session_id: sessionId,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
