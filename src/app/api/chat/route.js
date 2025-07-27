import { NextResponse } from 'next/server';

let lastMatchedJob = null; // Server-side memory

// Keywords for follow-up queries
function isFollowUp(message) {
  const keywords = ['prepare', 'salary', 'qualification', 'apply', 'experience', 'remote', 'perks'];
  return keywords.some(word => message.toLowerCase().includes(word));
}

// Greetings that should bypass job lookup
function isGreeting(message) {
  const normalized = message.trim().toLowerCase();
  return ['hi', 'hello', 'hey', 'salam', 'asalam', 'assalamu alaikum'].includes(normalized);
}

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1]?.content || '';

    if (!userMessage.trim()) {
      return NextResponse.json({
        choices: [{
          message: {
            role: 'assistant',
            content: "Can you please clarify your request? I'm here to help with job listings or interview tips."
          }
        }],
        matchedJob: lastMatchedJob || null,
      });
    }
    

    // Handle greetings without triggering FAISS
    if (isGreeting(userMessage)) {
      return NextResponse.json({
        choices: [{
          message: {
            role: 'assistant',
            content: "Hello! How can I assist you with job recommendations today?"
          }
        }],
        matchedJob: null
      });
    }

    let jobContext = 'No relevant job listings found.';

    // 🔁 Reuse last job if it's a follow-up
    if (isFollowUp(userMessage) && lastMatchedJob) {
      jobContext = `1. ${lastMatchedJob.title}\n${lastMatchedJob.description}\nApply here: ${lastMatchedJob.url}`;
    } else {
      // 🔍 Search FAISS server
      const faissRes = await fetch('http://35.227.145.87:5010/retrieve-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const faissData = await faissRes.json();
      const jobs = faissData?.results || [];

      if (jobs.length > 0) {
        lastMatchedJob = jobs[0];
        jobContext = jobs.map((job, i) => (
          `${i + 1}. ${job.title}\n${job.description}\nApply here: ${job.url}`
        )).join('\n\n');
      }
    }

    const prompt = `
The user asked: "${userMessage}"

Below are the most relevant job listings from our platform:

${jobContext}

Now respond to the user's query based on these jobs. Respond clearly, use bullet points or numbered lists if needed. Do not mention jobs that are not listed.
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message) {
      console.error('Invalid OpenRouter response:', data);
      return NextResponse.json({ error: 'OpenRouter response invalid' }, { status: 500 });
    }

    return NextResponse.json({
      choices: data.choices,
      matchedJob: lastMatchedJob || null,
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
