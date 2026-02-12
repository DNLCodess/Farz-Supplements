"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ProfileContent from "./content";

// Loading fallback for Suspense
function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-green-900 animate-spin" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}
