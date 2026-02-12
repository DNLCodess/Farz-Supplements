"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  Lock,
  LogOut,
  Loader2,
  Heart,
} from "lucide-react";
import { useAuth, useSignOut } from "@/hooks/use-auth";
import ProfileTab from "@/components/shared/profile/profile";
import AddressesTab from "@/components/shared/profile/address";
import OrdersTab from "@/components/shared/profile/orders";
import WishlistTab from "@/components/shared/profile/wishlist";
import SecurityTab from "@/components/shared/profile/security";

export default function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { mutate: signOut, isPending: signingOut } = useSignOut();

  // Get tab from URL or default to 'profile'
  const tabParam = searchParams.get("tab");
  const validTabs = ["profile", "addresses", "orders", "wishlist", "security"];
  const initialTab = validTabs.includes(tabParam) ? tabParam : "profile";

  const [activeTab, setActiveTab] = useState(initialTab);

  // Update activeTab when URL changes
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-900 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "security", label: "Security", icon: Lock },
  ];

  // Update URL when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push(`/profile?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              My Account
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back, {user?.first_name}!
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-green-50 text-green-900"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => signOut()}
                    disabled={signingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {signingOut ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogOut className="w-5 h-5" />
                    )}
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && <ProfileTab />}
              {activeTab === "addresses" && <AddressesTab />}
              {activeTab === "orders" && <OrdersTab />}
              {activeTab === "wishlist" && <WishlistTab />}
              {activeTab === "security" && <SecurityTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
