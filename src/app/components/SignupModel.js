"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../../library/firebase"; // Adjust the import path as necessary

export default function SignupModal({ onClose }) {
  const router = useRouter();
  const modalRef = useRef(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [error, setError] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const { setUser } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken(); // ✅ now user is defined

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // allow setting cookie from backend
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user); // Save user to context
        if (data.isNewUser) {
          router.push("/UserProfile");
        } else {
          router.push("/");
        }
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in popup was closed before completing login.");
      } else {
        setError("Google sign-in failed");
      }
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      const token = await user.getIdToken();

      const res = await fetch("/api/auth/facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Facebook login failed");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      if (data.isNewUser) {
        router.push("/UserProfile");
      } else {
        router.push("/");
      }
      onClose();
    } catch (err) {
      console.error("Facebook login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Facebook sign-in popup was closed before completing login.");
      } else {
        setError("Facebook sign-in failed");
      }
    }
  };

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("You must accept the Terms and Conditions.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Failed to sign up");
    }
  };

  const handleOtpVerify = async () => {
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      const me = await fetch("/api/auth/me");
      const meData = await me.json();
      if (meData.authenticated) setUser(meData.user);

      onClose();
      router.push("/UserProfile");
    } catch (err) {
      setError(err.message || "OTP verification failed");
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
              <h1 className="text-3xl font-semibold text-gray-900 mb-8">
                Welcome!
              </h1>
            </div>
            <div className="flex justify-center items-center flex-grow">
              <div className="flex items-center space-x-6">
                <div className="text-[200px] font-bold text-gray-900 min-w-max">
                  J.
                </div>
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
              Already a member?{" "}
              <span
                className="font-semibold underline cursor-pointer"
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    const loginBtn =
                      document.querySelector("[data-open-login]");
                    loginBtn?.click();
                  }, 300);
                }}
              >
                Log in
              </span>
            </p>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 flex flex-col justify-center items-center px-10 relative">
            <div className="w-full max-w-sm">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                {showOtp ? "Verify OTP" : "Create Account"}
              </h2>

              {error && (
                <p className="text-red-500 text-center mb-4 text-sm">{error}</p>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showOtp ? handleOtpVerify() : handleSubmit(e);
                }}
                className="space-y-4"
              >
                {!showOtp && (
                  <>
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full p-3 text-black border-b border-gray-300 focus:outline-none focus:border-black"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full p-3 text-black border-b border-gray-300 focus:outline-none focus:border-black"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 text-black border-b border-gray-300 focus:outline-none focus:border-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full p-3 text-black border-b border-gray-300 focus:outline-none focus:border-black"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          id="subscribe"
                          className="mr-2"
                          checked={subscribe}
                          onChange={() => setSubscribe(!subscribe)}
                        />
                        <label htmlFor="subscribe">
                          Please contact me via e-mail
                        </label>
                      </div>
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          className="mr-2"
                          checked={agreeTerms}
                          onChange={() => setAgreeTerms(!agreeTerms)}
                          required
                        />
                        <label htmlFor="agreeTerms">
                          I accept the{" "}
                          <span className="font-semibold">
                            Terms and Conditions
                          </span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {showOtp && (
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="w-full p-3 text-black border-b border-gray-300 focus:outline-none focus:border-black"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                )}

                <button
                  type="submit"
                  className="w-full p-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition-all"
                >
                  {showOtp ? "Verify OTP & Continue" : "Sign up"}
                </button>
              </form>

              {!showOtp && (
                <div className="mt-6">
                  <p className="text-left text-gray-600 mb-2">
                    Or sign up with
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={handleGoogleLogin}
                      className="text-black flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <FcGoogle className="text-xl" /> Google
                    </button>
                    <button
                      onClick={handleFacebookLogin}
                      className="text-black flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <FaFacebookF className="text-blue-600 text-xl" /> Facebook
                    </button>
                    {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                      <FaTwitter className="text-blue-400 text-xl" /> Twitter
                    </button>  */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
