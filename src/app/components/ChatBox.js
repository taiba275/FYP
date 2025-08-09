"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatBox({ onClose, userId }) {
  const modalRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  // ── Bootstrap session + prior 60 min state ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/chat", { method: "GET" });
        const data = await res.json();

        setSessionId(data.session_id ?? null);

        const formatted = Array.isArray(data.history)
          ? data.history.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.message ?? "",
            }))
          : [];

        setMessages([
          { role: "system", content: "You are a helpful assistant." },
          ...formatted,
        ]);

        setMatchedJobs(Array.isArray(data.previousResults) ? data.previousResults : []);
      } catch (err) {
        console.error("Error loading chat history:", err);
        setMessages([{ role: "system", content: "You are a helpful assistant." }]);
        setMatchedJobs([]);
      } finally {
        setBootstrapped(true);
      }
    })();
  }, []);

  // ── Modal body scroll + ESC close ───────────────────────────────────────
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    const handleEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = originalStyle;
    };
  }, [onClose]);

  // ── Ensure a session id before sending ──────────────────────────────────
  const ensureSession = async () => {
    const current = userId || sessionId;
    if (current) return current;

    const res = await fetch("/api/chat", { method: "GET" });
    const data = await res.json();
    setSessionId(data.session_id ?? null);
    return data.session_id;
  };

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    if (!bootstrapped) {
      await ensureSession();
    }
    const uid = await ensureSession();

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uid, // always send a valid id
          messages: updatedMessages,
          previousResults: matchedJobs,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`POST /api/chat failed: ${res.status} ${txt}`);
      }

      const data = await res.json();

      const assistantMessage = data?.choices?.[0]?.message;
      if (assistantMessage) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantMessage.content ?? "" },
        ]);
      }

      if (Array.isArray(data.results)) {
        setMatchedJobs(data.results);
      }
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }
    } catch (err) {
      console.error("Error in sendMessage:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Start new chat (wipe for this session) ──────────────────────────────
  const startNewChat = async () => {
    const id = userId || sessionId;
    if (!id) return;

    try {
      await fetch("http://chatbot-production-f34b.up.railway.app/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id }),
      });
    } catch (e) {
      console.error("Failed to start new chat:", e);
    } finally {
      setMessages([{ role: "system", content: "You are a helpful assistant." }]);
      setMatchedJobs([]);
      setInput("");
    }
  };

  // ── Delete chat (wipe + reset) ──────────────────────────────────────────
  const deleteChat = async () => {
    const id = userId || sessionId;
    if (!id) return;

    try {
      await fetch(`http://chatbot-production-f34b.up.railway.app/chat/history/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to delete chat:", e);
    } finally {
      setMessages([{ role: "system", content: "You are a helpful assistant." }]);
      setMatchedJobs([]);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 text-xl font-semibold flex items-center justify-between">
          <span>ChatBot</span>
          <div className="flex gap-2">
            <button
              onClick={startNewChat}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded"
              title="Start New Chat"
            >
              New Chat
            </button>
            <button
              onClick={deleteChat}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded"
              title="Delete Chat"
            >
              Delete Chat
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 border rounded bg-gray-50 text-sm whitespace-pre-wrap custom-scrollbar">
            {messages.slice(1).map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  msg.role === "user"
                    ? "text-right text-blue-600"
                    : "text-left text-gray-800"
                }`}
              >
                <p className="break-words whitespace-pre-wrap">
                  <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>{" "}
                  <span
                    // keep markdown links clickable
                    dangerouslySetInnerHTML={{
                      __html: (msg.content || "").replace(
                        /\[([^\]]+)\]\(([^)]+)\)/g,
                        '<a href="$2" target="_blank" class="text-blue-600 underline" rel="noopener noreferrer">$1</a>'
                      ),
                    }}
                  />
                </p>
              </div>
            ))}
            {loading && <p className="text-gray-500">Assistant is typing...</p>}
          </div>

          {matchedJobs.length > 0 && (
            <div className="mt-3 text-sm text-gray-700 bg-yellow-100 px-3 py-2 rounded break-words">
              <strong>🎯 Jobs Referenced:</strong>
              <ul className="list-disc ml-5 mt-1">
                {matchedJobs.slice(0, 3).map((job, i) => (
                  <li key={i}>
                    <strong>{job.title || "Job Listing"}</strong>
                    {job.company ? ` at ${job.company}` : ""}
                    {job.url && (
                      <>
                        {" — "}
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Apply
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex mt-4">
            <textarea
              rows={2}
              className="text-black flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none resize-none break-words"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question... (Shift + Enter for new line)"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading || !bootstrapped}
              className="bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-r text-sm hover:bg-blue-700"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
