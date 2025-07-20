'use client';

import { useState } from 'react';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
    
    // ✅ Check if OpenAI gave a proper response
    if (!data.choices || !data.choices[0]?.message) {
      throw new Error("Invalid response from assistant.");
    }
    
    const assistantMessage = data.choices[0].message;
    setMessages([...updatedMessages, assistantMessage]);
    

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full text-black-200">
      <div className="text-black flex-1 overflow-y-auto p-3 border rounded bg-gray-50 text-sm">
        {messages.slice(1).map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${
              msg.role === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-800'
            }`}
          >
            <p>
              <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
            </p>
          </div>
        ))}
        {loading && <p className="text-gray-500">Assistant is typing...</p>}
      </div>

      <div className="flex mt-2 text-black">
        <input
          className=" text-black flex-1 border rounded-l px-3 py-2 text-sm focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your question..."
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
