'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatBox({ onClose }) {
  const modalRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose?.(); // ✅ Notify parent to stop rendering
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (!data.choices || !data.choices[0]?.message) {
        throw new Error('Invalid response from assistant.');
      }

      const assistantMessage = data.choices[0].message;
      setMessages([...updatedMessages, assistantMessage]);

      if (Array.isArray(data.results)) {
        setMatchedJobs(data.results);
      } else {
        setMatchedJobs([]);
      }
    } catch (err) {
      console.error('Error fetching assistant response:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.(); // ✅ Notify parent to stop rendering
        }
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden "
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 text-xl font-semibold">
          ChatBot
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden ">
          <div className="flex-1 overflow-y-auto p-4 border rounded bg-gray-50 text-sm whitespace-pre-wrap custom-scrollbar">
            {messages.slice(1).map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${msg.role === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-800'
                  }`}
              >
                <p className="break-words whitespace-pre-wrap">
                  <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong>{' '}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(
                        /\[([^\]]+)\]\(([^)]+)\)/g,
                        '<a href="$2" target="_blank" class="text-blue-600 underline">$1</a>'
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
                    <strong>{job.title}</strong>
                    {job.company ? ` at ${job.company}` : ''} —{' '}
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Apply
                    </a>
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
              className="bg-blue-600 text-white px-4 py-2 rounded-r text-sm hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
