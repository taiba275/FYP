'use client';

import { useState } from 'react';
import MiniChatBox from './MiniChatBox';
import Image from 'next/image';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [preMessage, setPreMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = () => {
    setIsOpen(true);
  };

  return (
    <>
      {!isOpen && (
        <div
          className="text-black fixed bottom-[30px] right-[30px] z-[9999]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-fit h-fit">
            {isHovered && (
              <div className="absolute bottom-0 right-10 bg-white shadow-xl px-4 py-4 rounded-2xl w-[350px] border border-gray-200">
                <p className="text-sm text-gray-800">
                  Hey there <span className="animate-wave">👋</span> If you need any assistance, I’m always here
                </p>
                <div className="flex items-center mt-3 relative">
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
                </div>
              </div>
            )}

            <div onClick={handleSubmit} className="cursor-pointer">
              <div className="w-[60px] h-[60px] bg-[#0066FF] rounded-[12px] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.25)] relative">
                <Image
                  src="/Images/chat-icon.png"
                  alt="chat icon"
                  width={26}
                  height={26}
                  className="invert brightness-0"
                />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                  1
                </span>
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
