"use client";
import { useState } from "react";
import ResetPasswordModal from "./ResetPasswordModal";

export default function ForgotPasswordModal({ onClose, setEmail }) {
  const [localEmail, setLocalEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/send-otp-for-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: localEmail }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setOtpSent(true);
        setEmail(localEmail);
      }
    } catch (err) {
      setMessage("Failed to send OTP. Please try again.");
    }
  };

  if (otpSent) {
    return (
      <ResetPasswordModal
        email={localEmail}
        onClose={() => {
          setOtpSent(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Forgot Password</h2>
      {message && <p className="text-sm text-blue-600 mb-4 text-center">{message}</p>}
      <form onSubmit={handleSendOTP} className="space-y-4">
        <div>
          {/* <label className="text-sm text-gray-600">EMAIL ADDRESS</label> */}
          <input
            type="email"
            className="w-full p-3 border-b border-gray-300 focus:outline-none text-black"
            placeholder="Enter your email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition"
        >
          Send OTP
        </button>
        <button
          type="button"
          className="w-full p-3 mt-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          onClick={onClose}
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}
