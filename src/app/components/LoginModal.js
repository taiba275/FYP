"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ onClose }) {
  const router = useRouter();
  const modalRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState(""); // ✅ new
  const [stage, setStage] = useState("login"); // login | otp

  const { setUser } = useAuth(); // use context

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

     if (stage === "login") {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setStage("otp"); // ✅ move to OTP input
    } catch (err) {
      setError(err.message || "Failed to login");
    }
  } else {
    // ✅ OTP submission
    try {
      const verify = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      const data = await verify.json();
      if (!verify.ok) throw new Error(data.message || "OTP invalid");

      const me = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      const meData = await me.json();

      if (meData.authenticated) {
        setUser(meData.user);
        onClose();
      } else {
        throw new Error("Login failed after OTP");
      }
    } catch (err) {
      setError(err.message || "OTP verification failed");
    }
  }
};

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div
          ref={modalRef}
          className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-xl flex relative overflow-hidden"
        >
          {/* Left Panel */}
          <div className="w-1/2 bg-[#f5f5f5] flex flex-col justify-between px-10 py-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-8">Welcome!</h1>
            </div>
            <div className="flex justify-center items-center flex-grow">
              <div className="flex items-center space-x-6">
                <div className="text-[200px] font-bold text-gray-900 min-w-max">J.</div>
                <div className="w-64 h-64 mb-30 flex items-center justify-center">
                  <Image
                    src="/Images/smile.svg"
                    alt="Welcome Graphic"
                    width={280}
                    height={280}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Not a member yet?{" "}
              <span
                className="font-semibold underline cursor-pointer"
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    const signupBtn = document.querySelector("[data-open-signup]");
                    signupBtn?.click();
                  }, 300);
                }}
              >
                Register now
              </span>
            </p>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 flex flex-col justify-center items-center px-10 relative">
            <div className="w-full max-w-sm">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Log in</h2>

              {error && (
                <p className="text-red-500 text-center mb-4 text-sm">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
              {stage === "login" ? (
                <>
                  <div>
                    <label className="text-sm text-gray-600">EMAIL OR USERNAME</label>
                    <input
                      type="email"
                      placeholder="Email or Username"
                      className="w-full text-black p-3 border-b border-gray-300 focus:outline-none focus:border-black"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
              
                  <div>
                    <label className="text-sm text-gray-600">PASSWORD</label>
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full p-3 text-black border-b border-gray-300 focus:outline-none focus:border-black"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
              
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="mr-2"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Keep me logged in
                    </label>
                  </div>
              
                  <button
                    type="submit"
                    className="w-full p-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition-all"
                  >
                    Log in now
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-gray-600">ENTER OTP</label>
                    <input
                      type="text"
                      placeholder="Enter the 6-digit code"
                      className="w-full text-black p-3 border-b border-gray-300 focus:outline-none focus:border-black"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
              
                  <button
                    type="submit"
                    className="w-full p-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-800 transition-all"
                  >
                    Verify OTP & Login
                  </button>
                </>
              )}
            </form>
            

              <p className="text-right text-sm text-gray-600 mt-2">
                <Link href="/forgot-password" className="hover:underline">
                  Forgot your password?
                </Link>
              </p>

              <div className="mt-6">
                <p className="text-left text-gray-600 mb-2">Or sign in with</p>
                <div className="flex space-x-3 justify-center">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    <FcGoogle className="text-xl" /> Google
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    <FaFacebookF className="text-blue-600 text-xl" /> Facebook
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    <FaTwitter className="text-blue-400 text-xl" /> Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-right close button */}
      <button
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          cursor: "pointer",
          background: "#111",
          color: "#fff",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
          zIndex: 9999,
          transition: "opacity 0.3s ease-in-out",
        }}
        onClick={onClose}
        aria-label="Close modal"
      >
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="white"
          strokeWidth={2.5}
          width="26"
          height="26"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </>
  );
}
