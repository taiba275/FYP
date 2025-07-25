'use client';

import { useState } from 'react';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastMatchedJob, setLastMatchedJob] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

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

    if (data.matchedJob) {
      setLastMatchedJob(data.matchedJob);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // prevent new line
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full text-black-200">
      <div className="text-black flex-1 overflow-y-auto p-3 border rounded bg-gray-50 text-sm whitespace-pre-wrap">
        {messages.slice(1).map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${
              msg.role === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-800'
            }`}
          >
            <p className="whitespace-pre-wrap">
              <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
            </p>
          </div>
        ))}
        {loading && <p className="text-gray-500">Assistant is typing...</p>}
      </div>

      {lastMatchedJob && (
        <div className="mt-2 text-sm text-gray-600 bg-yellow-100 px-3 py-1 rounded">
          🎯 Talking about: <strong>{lastMatchedJob.title}</strong> at {lastMatchedJob.company}
        </div>
      )}

      <div className="flex mt-2 text-black">
        <textarea
          rows={2}
          className="text-black flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none resize-none"
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
  );
}
