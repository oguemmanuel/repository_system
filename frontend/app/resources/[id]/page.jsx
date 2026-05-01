"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard-header";
import ResourcePreview from "@/components/resource-preview";

export const dynamic = "force-dynamic";

export default function ResourceDetailPage({ params }) {
  const router = useRouter();

  // ✅ FIX 1: Properly unwrap params (Next.js 15)
  const resolvedParams = use(params);
  const resourceId = resolvedParams.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
          {
            credentials: "include",
        headers: { ...( typeof window !== "undefined" && localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {} ) },
          },
        );

        // ✅ FIX 2: Only redirect on 401 (not every error)
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          console.error("Auth request failed");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleApprove = async (resourceId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${resourceId}/status`,
        {
          method: "PATCH",
          credentials: "include",
        headers: { ...( typeof window !== "undefined" && localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {} ) },
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "approved" }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve resource");
      }

      toast.success("Resource has been approved and published");

      if (user?.role === "supervisor") {
        router.push("/dashboard/supervisor/pending");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error approving resource:", error);
      toast.error(
        error.message || "Failed to approve resource. Please try again.",
      );
      return false;
    }
    return true;
  };

  const handleReject = async (resourceId, rejectionReason) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${resourceId}/status`,
        {
          method: "PATCH",
          credentials: "include",
        headers: { ...( typeof window !== "undefined" && localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {} ) },
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "rejected",
            rejectionReason: rejectionReason,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject resource");
      }

      toast.success("Resource has been rejected");

      if (user?.role === "supervisor") {
        router.push("/dashboard/supervisor/pending");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error rejecting resource:", error);
      toast.error(
        error.message || "Failed to reject resource. Please try again.",
      );
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="px-4 py-6">
        <main className="flex w-full flex-col overflow-hidden py-6">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Resource Details
          </h1>
          <ResourcePreview
            resourceId={resourceId}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </main>
      </div>
    </div>
  );
}
