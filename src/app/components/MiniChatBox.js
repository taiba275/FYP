'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

export default function MiniChatBox({ onClose, initialMessage = '' }) {
  const modalRef = useRef(null);
  const scrollRef = useRef(null);

  // UI state
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [matchedJobs, setMatchedJobs] = useState([]); // aka previousResults
  const [sessionId, setSessionId] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // ---------- Helpers ----------
  const scrollToBottom = () => {
    // Wait for DOM paint
    requestAnimationFrame(() => {
      try {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch {}
    });
  };

  const mapHistoryToMessages = (history = []) =>
    history.map((h) => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.message || '',
    }));

  // ---------- Effects ----------
  // ESC to close
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  // Click outside to close (optional: comment out if you don’t want this)
  useEffect(() => {
    const onDown = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  // Fetch history + last jobs + session (also sets cookie)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/chat', { method: 'GET' });
        const data = await res.json(); // { history, previousResults, session_id }
        if (cancelled) return;

        const restored = mapHistoryToMessages(data.history || []);
        setMessages((prev) => [prev[0], ...restored]); // keep system msg at [0]
        setMatchedJobs(Array.isArray(data.previousResults) ? data.previousResults : []);
        setSessionId(data.session_id || null);
      } catch (e) {
        console.error('MiniChatBox: failed to load history:', e);
      } finally {
        if (!cancelled) setHistoryLoaded(true);
        scrollToBottom();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle initial message from the preview input AFTER history is in
  useEffect(() => {
    if (!historyLoaded) return;
    if (!initialMessage.trim()) return;

    const userMessage = { role: 'user', content: initialMessage };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setLoading(true);
    scrollToBottom();
    sendToBackend(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, historyLoaded]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // ---------- Networking ----------
  const sendToBackend = async (updatedMessages) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: updatedMessages,
          previousResults: matchedJobs, // enables follow-up path (no fresh search)
          user_id: sessionId,           // stick to same session for history
        }),
      });

      const data = await res.json();
      const assistantMessage = data?.choices?.[0]?.message;

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
        // if backend returned new results, keep them; otherwise preserve old
        setMatchedJobs(Array.isArray(data.results) ? data.results : matchedJobs);
      } else {
        console.warn('MiniChatBox: no assistant message in response');
      }
    } catch (err) {
      console.error('MiniChatBox: error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Handlers ----------
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput('');
    setLoading(true);
    scrollToBottom();

    await sendToBackend(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ---------- Render ----------
  return (
    <div className="text-black fixed bottom-[30px] right-[30px] z-[9999]">
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
              <p className="text-xs text-white text-opacity-80">
                {historyLoaded ? 'We are online!' : 'Loading history…'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 text-sm">
          {/* Skip system message at index 0 */}
          {messages.slice(1).map((msg, i) => (
            <div
              key={i}
              className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
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

          {/* Anchor for scroll-to-bottom */}
          <div ref={scrollRef} />
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
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full disabled:opacity-60"
            disabled={loading}
            aria-label="Send"
            title="Send"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}
