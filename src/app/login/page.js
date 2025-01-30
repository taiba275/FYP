"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login - Email:", email, "Password:", password);
    router.push("/"); // Redirect to home or dashboard
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-lg w-96 border border-white/30">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border border-white/40 rounded-lg bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-white/40 rounded-lg bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full p-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all duration-200">
            Login
          </button>
        </form>
        <p className="text-center text-white text-sm mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-200 hover:text-blue-300">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
