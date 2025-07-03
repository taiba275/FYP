"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaTwitter } from "react-icons/fa";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [error, setError] = useState("");

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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',  // <--- important for cookies
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',  // <--- important for cookies
      body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
          router.push("/UserProfile"); // Go to profile completion after signup
      } else {
        // Fallback: if login fails, go to login page
        router.push("/login");
      }
    } catch (err) {
      setError(err.message || "Failed to sign up");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Branding */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-gray-100">
        <h1 className="text-4xl font-bold text-black mb-4">Welcome!</h1>
        <div className="w-24 h-24 flex items-center justify-center rounded-full bg-green-200 border-4 border-purple-600">
          <span className="text-5xl text-purple-700">😊</span>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white shadow-lg">
        <div className="w-[400px]">

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">USERNAME</label>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 border-b border-gray-300 focus:outline-none focus:border-black transition-all text-gray-900 placeholder-gray-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">EMAIL</label>
              <input
                type="email"
                placeholder="E-mail"
                className="w-full p-3 border-b border-gray-300 focus:outline-none focus:border-black transition-all text-gray-900 placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">PASSWORD</label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border-b border-gray-300 focus:outline-none focus:border-black transition-all text-gray-900 placeholder-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  placeholder="Repeat Password"
                  className="w-full p-3 border-b border-gray-300 focus:outline-none focus:border-black transition-all text-gray-900 placeholder-gray-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Privacy and Terms Checkboxes */}
            <div className="text-sm text-gray-600">
              <p>
                GoogleForJobs may keep me informed with personalized emails about products
                and services. See our{" "}
                <span className="font-semibold">Privacy Policy</span> for more details.
              </p>
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="subscribe"
                  className="mr-2"
                  checked={subscribe}
                  onChange={() => setSubscribe(!subscribe)}
                />
                <label htmlFor="subscribe">Please contact me via e-mail</label>
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
                  I have read and accept the <span className="font-semibold">Terms and Conditions</span>
                </label>
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full p-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition-all duration-300"
            >
              Create Account
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-6">
            <p className="text-center text-gray-600 mb-2">Or register with</p>
            <div className="flex space-x-3 justify-center">
              {/* Google Button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-gray-700">
                <FcGoogle className="text-xl" /> Google
              </button>

              {/* Facebook Button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-gray-700">
                <FaFacebookF className="text-blue-600 text-xl" /> Facebook
              </button>

              {/* Twitter Button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all text-gray-700">
                <FaTwitter className="text-blue-400 text-xl" /> Twitter
              </button>
            </div>
          </div>

          {/* Already a Member */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Are you a member?{" "}
            <Link href="/login" className="text-black font-semibold hover:underline">
              Log in now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
