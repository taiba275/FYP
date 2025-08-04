"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPasswordModal({ email, onClose }) {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/verify-otp-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) setSuccess(true);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Success!</h2>
        <p className="text-green-600 mb-6">
          Your password has been reset. You can now log in.
        </p>
        <button
          className="w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition"
          onClick={onClose}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">ENTER OTP</label>
          <input
            type="text"
            placeholder="6-digit code"
            className="w-full p-3 border-b border-gray-300 focus:outline-none text-black"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <label className="text-sm text-gray-600">NEW PASSWORD</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            className="w-full p-3 border-b border-gray-300 focus:outline-none text-black pr-10"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[42px] transform -translate-y-1/2 cursor-pointer text-gray-500 p-1"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition"
        >
          Reset Password
        </button>
        {onClose && (
          <button
            type="button"
            className="w-full p-3 mt-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            onClick={onClose}
          >
            Back to Login
          </button>
        )}
      </form>
      {message && (
        <p className="text-blue-600 text-sm mt-4 text-center">{message}</p>
      )}
    </div>
  );
}
