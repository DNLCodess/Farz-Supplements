export const metadata = {
  title: {
    default: "Account",
    template: "%s | Farz Supplements",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }) {
  return <div className="min-h-screen">{children}</div>;
}
