"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "./ForgotPasswordModal";
import ResetPasswordModal from "./ResetPasswordModal";

export default function LoginModal({ onClose }) {
  const router = useRouter();
  const params = useSearchParams();
  const modalRef = useRef(null);
  const [stage, setStage] = useState("login"); // "login", "otp", "forgot", "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const resetToken = params.get("resetToken");
  const resetEmail = params.get("email");

  const { setUser } = useAuth();

  // ESC to close
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Open reset modal automatically if token + email are present
  useEffect(() => {
    if (resetToken && resetEmail) {
      setStage("reset");
    }
  }, [resetToken, resetEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (stage === "login") {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        setStage("otp");
      } catch (err) {
        setError(err.message || "Error logging in");
      }
    } else if (stage === "otp") {
      try {
        const res = await fetch("/api/auth/verify-login-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, otp, rememberMe }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "OTP invalid");

        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        const meData = await meRes.json();

        if (meData.authenticated) {
          setUser(meData.user);
          onClose();
        } else {
          throw new Error("Failed to complete login");
        }
      } catch (err) {
        setError(err.message || "OTP error");
      }
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
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
                  <Image src="/Images/smile.svg" alt="Welcome Graphic" width={280} height={280} />
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
              {stage === "forgot" ? (
                <ForgotPasswordModal
                  onClose={() => setStage("login")}
                  setEmail={setEmail}
                />
              ) : stage === "reset" ? (
                <ResetPasswordModal
                  email={resetEmail}
                  token={resetToken}
                  onClose={() => {
                    setStage("login");
                    router.replace("/", { scroll: false });
                  }}
                />
              ) : (
                <>
                  <h2 className="text-4xl font-bold text-gray-800 mb-6">Log in</h2>
                  {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {stage === "login" && (
                      <>
                        <div>
                          <label className="text-sm text-gray-600">EMAIL OR USERNAME</label>
                          <input
                            type="email"
                            className="w-full p-3 border-b border-gray-300 focus:outline-none text-black"
                            placeholder="Email or Username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">PASSWORD</label>
                          <input
                            type="password"
                            className="w-full p-3 border-b border-gray-300 focus:outline-none text-black"
                            placeholder="Password"
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
                          className="w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition"
                        >
                          Log in now
                        </button>
                      </>
                    )}
                    {stage === "otp" && (
                      <>
                        <div>
                          <label className="text-sm text-gray-600">ENTER OTP</label>
                          <input
                            type="text"
                            placeholder="Enter the 6-digit code"
                            className="w-full p-3 border-b border-gray-300 focus:outline-none text-black"
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

                  {stage === "login" && (
                    <p className="text-right text-sm text-gray-600 mt-2">
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={() => setStage("forgot")}
                      >
                        Forgot your password?
                      </span>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
