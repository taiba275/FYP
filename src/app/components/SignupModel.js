"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import {
  FaFacebookF,
  FaGithub,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
  githubProvider,
} from "../../library/firebase";

const RESEND_COOLDOWN = 30; // seconds

export default function SignupModal({ onClose, switchTo }) {
  const router = useRouter();
  const modalRef = useRef(null);

  // form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(false);

  // flow state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // ui state
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(""); // success/info line
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  // resend OTP state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const cooldownIntervalRef = useRef(null);

  // SSO control
  const ssoRef = useRef(null);
  const [ssoLoading, setSsoLoading] = useState(null);
  const unlockTimerRef = useRef(null);

  // lifecycle helpers
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const { setUser } = useAuth();

  useEffect(() => {
    mountedRef.current = true;

    const onFocus = () => {
      if (ssoLoading && ssoRef.current) setSsoLoading(null);
    };
    const onVis = () => {
      if (
        document.visibilityState === "visible" &&
        ssoLoading &&
        ssoRef.current
      ) {
        setSsoLoading(null);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      if (cooldownIntervalRef.current)
        clearInterval(cooldownIntervalRef.current);
    };
  }, [ssoLoading]);

  const safeClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  // cooldown helper
  const startResendCooldown = () => {
    setResendSeconds(RESEND_COOLDOWN);
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    cooldownIntervalRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // ---------- Unified SSO with instant-UI unlock ----------
  const ssoSignIn = async (name, provider, endpoint) => {
    if (ssoRef.current) return;
    setError("");
    setNotice("");
    setSsoLoading(name);

    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = setTimeout(() => {
      if (mountedRef.current && ssoRef.current) setSsoLoading(null);
    }, 1200);

    try {
      ssoRef.current = signInWithPopup(auth, provider);
      const result = await ssoRef.current;
      const token = await result.user.getIdToken();

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `${name} signup failed`);

      if (mountedRef.current) setUser(data.user);
      router.push(data.isNewUser ? "/UserProfile" : "/");
      safeClose();
    } catch (err) {
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        ssoRef.current = null;
        if (mountedRef.current) setSsoLoading(null);
        return;
      }
      console.error(`${name} signup error:`, err);
      if (mountedRef.current) setError(`${name} sign-up failed`);
    } finally {
      ssoRef.current = null;
      if (mountedRef.current) setSsoLoading(null);
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = null;
      }
    }
  };

  const handleGoogleLogin = () =>
    ssoSignIn("Google", googleProvider, "/api/auth/google");
  const handleFacebookLogin = () =>
    ssoSignIn("Facebook", facebookProvider, "/api/auth/facebook");
  const handleGithubLogin = () =>
    ssoSignIn("GitHub", githubProvider, "/api/auth/github");

  // ---------- Email/Password Flow ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    // basic validations
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

    setLoadingSignup(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      if (mountedRef.current) {
        setShowOtp(true);
        setNotice("OTP sent to your email.");
        startResendCooldown(); // start cooldown right after initial send
      }
    } catch (err) {
      if (err.name !== "AbortError" && mountedRef.current) {
        setError(err.message || "Failed to sign up");
      }
    } finally {
      if (mountedRef.current) setLoadingSignup(false);
    }
  };

  const handleOtpVerify = async () => {
    setError("");
    setNotice("");
    setLoadingOtp(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp, rememberMe }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      const me = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      const meData = await me.json();

      if (meData.authenticated && mountedRef.current) setUser(meData.user);

      safeClose();
      router.push("/UserProfile");
    } catch (err) {
      if (err.name !== "AbortError" && mountedRef.current) {
        setError(err.message || "OTP verification failed");
      }
    } finally {
      if (mountedRef.current) setLoadingOtp(false);
    }
  };

  const handleResendSignupOtp = async () => {
    if (resendSeconds > 0 || resendLoading) return;
    setError("");
    setNotice("");
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP");

      if (mountedRef.current) {
        setNotice("OTP resent. Please check your email.");
        startResendCooldown();
      }
    } catch (err) {
      if (mountedRef.current) setError(err.message || "Failed to resend OTP");
    } finally {
      if (mountedRef.current) setResendLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && safeClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) safeClose();
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-xl flex relative overflow-hidden"
      >
        {/* Left Panel */}
        <div className="w-1/2 bg-[#f5f5f5] flex flex-col justify-between px-10 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome!</h1>
          <div className="flex justify-center items-center flex-grow">
            <div className="flex items-center space-x-6">
              <div className="text-[200px] font-bold text-gray-900 min-w-max">
                J.
              </div>
              <div className="w-64 h-64 flex items-center justify-center">
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
                if (typeof switchTo === "function") {
                  switchTo("login");
                } else {
                  safeClose();
                  setTimeout(() => {
                    document.querySelector("[data-open-login]")?.click();
                  }, 0);
                }
              }}
            >
              Log in
            </span>
          </p>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col justify-center items-center px-10 relative">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              {showOtp && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false);
                    setOtp("");
                    setError("");
                    setNotice("");
                  }}
                  disabled={loadingOtp}
                  className={`p-2 rounded hover:bg-gray-100 transition ${
                    loadingOtp ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <FaArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <h2 className="text-4xl font-bold text-gray-800">
                {showOtp ? "Verify OTP" : "Create Account"}
              </h2>
            </div>

            {error && (
              <p className="text-red-500 text-center mb-2 text-sm">{error}</p>
            )}
            {notice && (
              <p className="text-green-600 text-center mb-2 text-sm">
                {notice}
              </p>
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
                    className="w-full p-3 text-black border-b border-gray-300 focus:outline-none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 text-black border-b border-gray-300 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full p-3 text-black border-b border-gray-300 focus:outline-none pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <FaEyeSlash className={!showPassword ? "hidden" : ""} />
                        <FaEye className={showPassword ? "hidden" : ""} />
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className="w-full p-3 text-black border-b border-gray-300 focus:outline-none pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                        title={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        <FaEyeSlash
                          className={!showConfirmPassword ? "hidden" : ""}
                        />
                        <FaEye
                          className={showConfirmPassword ? "hidden" : ""}
                        />
                      </span>
                    </div>
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
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="w-full p-3 text-black border-b border-gray-300 focus:outline-none"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />

                  {/* Resend row (always visible in OTP step) */}
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Didn’t receive the code?
                    </span>
                    <button
                      type="button"
                      onClick={handleResendSignupOtp}
                      disabled={resendLoading || resendSeconds > 0}
                      className={`underline font-medium ${
                        resendLoading || resendSeconds > 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      {resendLoading
                        ? "Resending..."
                        : resendSeconds > 0
                        ? `Resend in ${resendSeconds}s`
                        : "Resend OTP"}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="mr-2"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="rememberMe">Remember me for 30 days</label>
                  </div>
                </>
              )}
            </form>

            {!showOtp && (
              <div className="mt-6">
                <p className="text-left text-gray-600 mb-2">Or sign up with</p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={!!ssoLoading}
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg ${
                      ssoLoading
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FcGoogle className="text-xl" /> Google
                  </button>
                  <button
                    onClick={handleFacebookLogin}
                    disabled={!!ssoLoading}
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg ${
                      ssoLoading
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FaFacebookF className="text-blue-600 text-xl" /> Facebook
                  </button>
                  <button
                    onClick={handleGithubLogin}
                    disabled={!!ssoLoading}
                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg ${
                      ssoLoading
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FaGithub className="text-xl" /> GitHub
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
