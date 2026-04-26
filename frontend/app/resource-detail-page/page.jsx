"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResourceDetailPage({ params }) {
  const resourceId = params?.resourceId;
  const [resource, setResource] = useState(null);
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${resourceId}`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) throw new Error("Failed to fetch resource");

        const data = await response.json();
        setResource(data);
      } catch (error) {
        console.error("Error fetching resource:", error);
        toast.error("Failed to fetch resource. Please try again.");
      }
    };

    if (resourceId) fetchResource();
  }, [resourceId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!resource) {
    return <div>Loading resource details...</div>;
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${resourceId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "approved",
            approvalReason,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to approve resource");

      toast.success("Resource approved");

      router.push(
        user?.role === "supervisor"
          ? "/dashboard/supervisor/pending"
          : "/dashboard",
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${resourceId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        },
      );

      if (!response.ok) throw new Error("Failed to reject resource");

      toast.success("Resource rejected");

      router.push(
        user?.role === "supervisor"
          ? "/dashboard/supervisor/pending"
          : "/dashboard",
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{resource.title}</h1>

      <p className="mb-2">
        <strong>Description:</strong> {resource.description}
      </p>

      <p className="mb-2">
        <strong>URL:</strong>{" "}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          {resource.url}
        </a>
      </p>

      <p className="mb-2">
        <strong>Category:</strong> {resource.category}
      </p>

      <p className="mb-2">
        <strong>Status:</strong> {resource.status}
      </p>

      {resource.status === "pending" && user?.role === "supervisor" && (
        <div className="flex gap-4 mt-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Approve</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Resource</DialogTitle>
                <DialogDescription>Enter approval reason</DialogDescription>
              </DialogHeader>

              <Input
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder="Reason"
              />

              <Button onClick={handleApprove} className="mt-4">
                Confirm Approve
              </Button>
            </DialogContent>
          </Dialog>

          <Button variant="destructive" onClick={handleReject}>
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
