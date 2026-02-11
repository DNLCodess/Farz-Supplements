"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { signIn } from "@/app/actions/auth";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = searchParams.get("redirect") || "/profile";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn(formData);

      if (result.success) {
        toast.success("Welcome back!");
        // Use window.location for a hard redirect
        window.location.href = result.redirectTo || redirectTo;
      } else {
        setError(result.error || "Failed to sign in");
        toast.error(result.error || "Failed to sign in");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full Screen Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070')",
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/95 via-green-800/90 to-green-950/95"></div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNGgydjJoLTJ2LTJ6bS0yIDJ2Mmgydi0yaC0yem0wLTJ2Mmgydi0yaC0yem0tMiAyaDJ2LTJoLTJ2MnptMi00aDJ2Mmgtdi0yem0tMiAyaDJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      </div>

      {/* Floating Card - Centered */}
      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-6">
        {/* Logo - Above Card */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-105 transition-transform">
              <svg
                className="w-9 h-9 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white drop-shadow-lg">
              Farz Supplements
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-base text-gray-600">
              Sign in to continue your wellness journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-1.5"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-900 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all pr-11"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  value="true"
                  className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-900"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-green-900 hover:text-green-700 font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-900 text-white py-3.5 rounded-xl text-base font-bold hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-900 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-green-900 hover:text-green-700 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-600 leading-relaxed">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="text-green-900 hover:underline font-medium"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-green-900 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/90 drop-shadow-md">
            🔒 Secure SSL encrypted connection
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
