'use client';

import { useState } from 'react';
import MiniChatBox from './MiniChatBox';
import Image from 'next/image';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [preMessage, setPreMessage] = useState('');

  const handleSubmit = () => {
    setIsOpen(true); // Always open MiniChatBox on click
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2">
          {/* Widget Preview Box */}
          <div className="relative bg-white shadow-xl px-4 py-4 rounded-2xl w-[320px] border border-gray-200">
            <p className="text-sm text-gray-800">
              Hey there <span className="animate-wave">👋</span> If you need any assistance, I’m always here
            </p>

            <div className="flex items-center mt-3 pr-14 relative">
              <input
                type="text"
                value={preMessage}
                onChange={(e) => setPreMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                placeholder="Enter your message..."
                className="w-full px-3 py-2 border text-sm rounded-lg text-gray-800 focus:outline-none"
              />

              {/* Floating button (positioned on top-right, sticking out) */}
              <div
                onClick={handleSubmit}
                className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white p-[3px] rounded-full shadow-md cursor-pointer"
              >
                <div className="relative bg-[#0066FF] w-10 h-10 rounded-full flex items-center justify-center">
                  <Image
                    src="/Images/chat-icon.png" // ✅ Icon must be in /public/Images/
                    alt="chat icon"
                    width={20}
                    height={20}
                  />
                  {/* Red badge */}
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <MiniChatBox
          onClose={() => {
            setIsOpen(false);
            setPreMessage('');
          }}
          initialMessage={preMessage}
        />
      )}
    </>
  );
}
