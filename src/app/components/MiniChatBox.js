'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

export default function MiniChatBox({ onClose, initialMessage = '' }) {
  const modalRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Handle initial message from preview input
  useEffect(() => {
    if (initialMessage.trim()) {
      const userMessage = { role: 'user', content: initialMessage };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setLoading(true);
      sendInitialMessage(updatedMessages);
    }
  }, [initialMessage]);

  const sendInitialMessage = async (updatedMessages) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      const assistantMessage = data.choices?.[0]?.message;
      if (assistantMessage) {
        setMessages([...updatedMessages, assistantMessage]);
        setMatchedJobs(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      console.error('Error fetching assistant response:', err);
    } finally {
      setLoading(false);
    }
  };

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

      const assistantMessage = data.choices?.[0]?.message;
      if (assistantMessage) {
        setMessages([...updatedMessages, assistantMessage]);
        setMatchedJobs(Array.isArray(data.results) ? data.results : []);
      } else {
        throw new Error('No assistant message found');
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
    <div className="fixed bottom-20 right-6 z-50">
      <div
        ref={modalRef}
        className="w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/Images/chatbot-avatar.png"
              className="w-9 h-9 rounded-full border-2 border-white"
              alt="Chatbot"
            />
            <div>
              <p className="text-sm font-semibold">Chat with Us!</p>
              <p className="text-xs text-white text-opacity-80">We are online!</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 text-sm">
          {messages.slice(1).map((msg, i) => (
            <div key={i} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`px-3 py-2 rounded-xl max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-300 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-gray-500 text-xs italic mt-2">Assistant is typing…</div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-white flex">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message..."
            className="flex-1 text-sm px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}
