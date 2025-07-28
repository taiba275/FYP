import { NextResponse } from "next/server";

let jobMatches = [];

function isFollowUp(message) {
  const keywords = ["prepare", "salary", "qualification", "apply", "experience", "remote", "perks"];
  return keywords.some((word) => message.toLowerCase().includes(word));
}

function isGreeting(message) {
  const normalized = message.trim().toLowerCase();
  return ["hi", "hello", "hey", "salam", "asalam", "assalamu alaikum"].includes(normalized);
}

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1]?.content || "";

    if (!userMessage.trim()) {
      return NextResponse.json({
        choices: [{
          message: {
            role: "assistant",
            content: "Can you please clarify your request? I'm here to help with job listings or interview tips.",
          },
        }],
        matchedJob: jobMatches[0] || null,
      });
    }

    if (isGreeting(userMessage)) {
      return NextResponse.json({
        choices: [{
          message: {
            role: "assistant",
            content: "Hello! How can I assist you with job recommendations today?",
          },
        }],
        matchedJob: null,
      });
    }

    let jobContext = "No relevant job listings found.";

    if (isFollowUp(userMessage) && jobMatches.length > 0) {
      const job = jobMatches[0];
      jobContext = `Job 1:
- **Title:** ${job.title}
- **Description:** ${job.description}
- **Salary:** ${job.salary || "Not specified"}
- **Apply URL:** ${job.url}`;
    } else {
      const faissRes = await fetch("http://localhost:5010/retrieve-jobs", {    //http://35.227.145.87:5010/retrieve-jobs
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const faissData = await faissRes.json();
      const jobs = faissData?.results || [];

      if (jobs.length > 0) {
        jobMatches = jobs;
        jobContext = jobs.map((job, i) => (
`Job ${i + 1}:
- **Title:** ${job.title}
- **Description:** ${job.description}
- **Salary:** ${job.salary || 'Not specified'}
- **Apply URL:** [Apply Here](${job.url})`
        )).join('\n\n');
      }
    }

   const prompt = `
The user asked: "${userMessage}"

Below are the most relevant job listings from our platform:

${jobContext}

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
   - Suggest **online resources to prepare**, such as:
     - Specific courses (e.g., from freeCodeCamp, Udemy, Coursera)
     - GitHub repositories or articles
   - Organize the learning into a **step-by-step preparation flow** with bullet points.

3. If the user asks follow-up questions like "salary", "remote", or "skills":
   - Only respond using data from the listed jobs above.
   - Do NOT add any external assumptions.

4. Never invent or refer to jobs that are not explicitly listed above.
5. Use **bullet points or numbered lists** to make the response clear and scannable.
6. All links must be **clickable markdown format**, e.g., [Apply Here](job.url).

Be concise, helpful, and accurate in all responses.
`;


    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message) {
      console.error("Invalid OpenRouter response:", data);
      return NextResponse.json({ error: "OpenRouter response invalid" }, { status: 500 });
    }

    return NextResponse.json({
      choices: data.choices,
      matchedJob: jobMatches[0] || null,
    });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
