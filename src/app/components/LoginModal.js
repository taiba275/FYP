"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "./ForgotPasswordModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { signInWithPopup } from "firebase/auth";
import {
  auth,
  googleProvider,
  facebookProvider,
  githubProvider,
} from "../../library/firebase";

const RESEND_COOLDOWN = 30; // seconds

export default function LoginModal({ onClose, switchTo }) {
  const router = useRouter();
  const params = useSearchParams();
  const modalRef = useRef(null);

  const [stage, setStage] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  // resend state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const cooldownIntervalRef = useRef(null);

  // prevent concurrent popups / double-clicks
  const ssoRef = useRef(null);
  const [ssoLoading, setSsoLoading] = useState(null);
  const unlockTimerRef = useRef(null);

  // abort + mounted guards
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const resetToken = params.get("resetToken");
  const resetEmail = params.get("email");

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

  useEffect(() => {
    if (resetToken && resetEmail) setStage("reset");
  }, [resetToken, resetEmail]);

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

  // ---------- Unified SSO helper with instant-UI unlock ----------
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
      if (!res.ok) throw new Error(data.message || `${name} login failed`);

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
      console.error(`${name} login error:`, err);
      if (mountedRef.current) setError(`${name} sign-in failed`);
    } finally {
      ssoRef.current = null;
      if (mountedRef.current) setSsoLoading(null);
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = null;
      }
    }
  };

  const handleGithubLogin = () =>
    ssoSignIn("GitHub", githubProvider, "/api/auth/github");
  const handleGoogleLogin = () =>
    ssoSignIn("Google", googleProvider, "/api/auth/google");
  const handleFacebookLogin = () =>
    ssoSignIn("Facebook", facebookProvider, "/api/auth/facebook");

  // ---------- Email/Password Flow ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (stage === "login") {
      setLoadingLogin(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");

        if (mountedRef.current) {
          setStage("otp");
          setNotice("OTP sent to your email.");
          startResendCooldown(); // start cooldown after first send
        }
      } catch (err) {
        if (err.name !== "AbortError" && mountedRef.current) {
          setError(err.message || "Error logging in");
        }
      } finally {
        if (mountedRef.current) setLoadingLogin(false);
      }
    } else if (stage === "otp") {
      setLoadingOtp(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/auth/verify-login-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, otp, rememberMe }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "OTP invalid");

        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const meData = await meRes.json();

        if (meData.authenticated) {
          if (mountedRef.current) setUser(meData.user);
          safeClose();
        } else {
          throw new Error("Failed to complete login");
        }
      } catch (err) {
        if (err.name !== "AbortError" && mountedRef.current) {
          setError(err.message || "OTP error");
        }
      } finally {
        if (mountedRef.current) setLoadingOtp(false);
      }
    }
  };

  const handleResendLoginOtp = async () => {
    if (resendSeconds > 0 || resendLoading) return;
    setError("");
    setNotice("");
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend-login-otp", {
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

  // ESC to close
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome!</h1>
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
            Not a member yet?{" "}
            <span
              className="font-semibold underline cursor-pointer"
              onClick={() => {
                if (typeof switchTo === "function") {
                  switchTo("signup");
                } else {
                  safeClose();
                  setTimeout(() => {
                    document.querySelector("[data-open-signup]")?.click();
                  }, 0);
                }
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
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Log in
                </h2>
                {error && (
                  <p className="text-red-500 text-sm mb-2 text-center">
                    {error}
                  </p>
                )}
                {notice && (
                  <p className="text-green-600 text-sm mb-2 text-center">
                    {notice}
                  </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {stage === "login" && (
                    <>
                      <div>
                        <input
                          type="email"
                          className="w-full p-3 border-b border-gray-300 focus:outline-none text-black"
                          placeholder="Email or Username"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full p-3 border-b border-gray-300 focus:outline-none text-black pr-10"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                          title={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          className="mr-2"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-gray-600"
                        >
                          Keep me logged in
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={loadingLogin}
                        aria-busy={loadingLogin}
                        className={`w-full p-3 bg-black text-white font-semibold rounded-lg transition ${
                          loadingLogin
                            ? "opacity-70 cursor-wait"
                            : "hover:bg-gray-800"
                        }`}
                      >
                        {loadingLogin ? "Logging in..." : "Log in now"}
                      </button>
                    </>
                  )}

                  {stage === "otp" && (
                    <>
                      <input
                        type="text"
                        placeholder="Enter the 6-digit code from Email"
                        className="w-full p-3 border-b border-gray-300 focus:outline-none text-black"
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
                          onClick={handleResendLoginOtp}
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

                      <button
                        type="submit"
                        disabled={loadingOtp}
                        aria-busy={loadingOtp}
                        className={`w-full mt-3 p-3 rounded-lg bg-blue-600 text-white font-semibold transition-all ${
                          loadingOtp
                            ? "opacity-70 cursor-wait"
                            : "hover:bg-blue-800"
                        }`}
                      >
                        {loadingOtp ? "Verifying...." : "Verify OTP & Login"}
                      </button>
                    </>
                  )}
                </form>

                {stage === "login" && (
                  <>
                    <div className="mt-6">
                      <p className="text-left text-gray-600 mb-2">
                        Or log in with
                      </p>
                      <div className="flex space-x-3 justify-center">
                        <button
                          onClick={handleGoogleLogin}
                          disabled={!!ssoLoading}
                          className={`text-black flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg ${
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
                          className={`text-black flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg ${
                            ssoLoading
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <FaFacebookF className="text-blue-600 text-xl" />{" "}
                          Facebook
                        </button>
                        <button
                          onClick={handleGithubLogin}
                          disabled={!!ssoLoading}
                          className={`text-black flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg ${
                            ssoLoading
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <FaGithub className="text-xl" /> GitHub
                        </button>
                      </div>
                    </div>

                    <p className="text-right text-sm text-gray-600 mt-2">
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={() => setStage("forgot")}
                      >
                        Forgot your password?
                      </span>
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
