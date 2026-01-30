export const metadata = {
  title: "Login",
  description: "Login to your Farz Supplements account",
};

export default function LoginPage() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      <form className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-charcoal mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-charcoal mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Remember me</span>
          </label>

          <a
            href="/reset-password"
            className="text-sm text-green-900 hover:text-green-700 font-medium"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full bg-green-900 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don&lsquo;t have an account?{" "}
          <a
            href="/register"
            className="text-green-900 hover:text-green-700 font-medium"
          >
            Sign up
          </a>
        </p>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-green-900 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" className="text-green-900 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
