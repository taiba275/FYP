"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaTwitter } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',  // <--- important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

        // Store the token in cookies (browser handles the cookie storage automatically)
      const token = data.token;

      // Set the token in a cookie for subsequent requests
      document.cookie = `token=${token}; path=/; max-age=604800`; // 7 days expiration for the token

      router.push("/");
    } catch (err) {
      setError(err.message || "Failed to login");
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

      {/* Right Section - Login Form */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white shadow-lg">
        <div className="w-[400px]">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Log in
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">EMAIL OR USERNAME</label>
              <input
                type="email"
                placeholder="Email or Username"
                className="w-full p-3 border-b border-gray-300 focus:outline-none focus:border-black transition-all text-gray-900 placeholder-gray-500"
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
                className="w-full p-3 border-b border-gray-300 focus:outline-none focus:border-black transition-all text-gray-900 placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember Me Checkbox */}
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

            {/* Login Button */}
            <button
              type="submit"
              className="w-full p-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition-all duration-300"
            >
              Log in now
            </button>
          </form>

          {/* Forgot Password */}
          <p className="text-right text-sm text-gray-600 mt-2">
            <Link href="/forgot-password" className="hover:underline">
              Forgot your password?
            </Link>
          </p>

          {/* Social Logins */}
          <div className="mt-6">
            <p className="text-center text-gray-600 mb-2">Or sign in with</p>
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
            Don't have an account?{" "}
            <Link href="/signup" className="text-black font-semibold hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
