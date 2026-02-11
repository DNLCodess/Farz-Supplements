"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { signUp } from "@/app/actions/auth";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validatePasswords = (pass, confirmPass) => {
    if (confirmPass && pass !== confirmPass) {
      setPasswordMatch(false);
      return false;
    }
    setPasswordMatch(true);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(formData);

      if (result.success) {
        setShowSuccessModal(true);
        toast.success("Account created successfully!");
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(result.error || "Failed to create account");
        toast.error(result.error || "Failed to create account");
      }
    } catch (err) {
      console.error("Signup error:", err);
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
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-base text-gray-600">
              Join our wellness community
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-900 mb-1.5"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-900 mb-1.5"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-900 mb-1.5"
              >
                Phone{" "}
                <span className="text-xs font-normal text-gray-500">
                  (optional)
                </span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+234 800 000 0000"
                className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
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
                  value={password}
                  placeholder="••••••••"
                  minLength={8}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all pr-11"
                  required
                  disabled={isLoading}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(newPassword);
                    validatePasswords(newPassword, confirmPassword);
                  }}
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
              <p className="mt-1 text-xs text-gray-600">
                At least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-900 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  placeholder="••••••••"
                  className={`w-full px-3 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 transition-all pr-11 ${
                    passwordMatch
                      ? "border-gray-300 focus:ring-green-900 focus:border-transparent"
                      : "border-red-300 focus:ring-red-500 focus:border-transparent"
                  }`}
                  required
                  disabled={isLoading}
                  onChange={(e) => {
                    const newConfirmPassword = e.target.value;
                    setConfirmPassword(newConfirmPassword);
                    validatePasswords(password, newConfirmPassword);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {!passwordMatch && confirmPassword && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {passwordMatch && confirmPassword && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordMatch}
              className="w-full bg-green-900 text-white py-3.5 rounded-xl text-base font-bold hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-900 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-900 hover:text-green-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-center text-xs text-gray-600 leading-relaxed">
              By creating an account, you agree to our{" "}
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
            🔒 Your information is secure and encrypted
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform animate-in zoom-in-95 duration-300">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
                  <CheckCircle2
                    className="w-10 h-10 text-white"
                    strokeWidth={3}
                  />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Account Created!
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                Welcome to Farz Supplements
              </p>
              <p className="text-base text-gray-500">
                Your account has been successfully created. Redirecting you to
                login...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-progress"
                  style={{
                    animation: "progress 3s linear forwards",
                  }}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-green-900 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-900 focus:ring-offset-2 shadow-lg"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
