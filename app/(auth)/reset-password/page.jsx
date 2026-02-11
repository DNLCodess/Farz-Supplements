"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { resetPassword } from "@/app/actions/auth";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

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
    const newPassword = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(newPassword);

      if (result.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "Failed to reset password");
        toast.error(result.error || "Failed to reset password");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your password has been updated. Redirecting to login...
            </p>
            <Link
              href="/login"
              className="inline-block bg-green-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-900" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-900 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-900 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  placeholder="••••••••"
                  minLength={8}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all pr-12"
                  required
                  disabled={isLoading}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(newPassword);
                    if (confirmPassword) {
                      validatePasswords(newPassword, confirmPassword);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-base font-medium text-gray-900 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  placeholder="••••••••"
                  className={`w-full px-4 py-4 border rounded-xl text-base focus:outline-none focus:ring-2 transition-all pr-12 ${
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {!passwordMatch && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Passwords do not match
                </p>
              )}
              {passwordMatch && confirmPassword && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordMatch}
              className="w-full bg-green-900 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-900 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-base text-green-900 hover:text-green-700 font-medium transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
