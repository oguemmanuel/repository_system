"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AISummaryButton({ resourceId, title }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setSummary("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/cached-summary/${resourceId}`,
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "AI generation failed");
      }

      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setSummary("⚠️ Failed to generate summary. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (isOpen) => {
    setOpen(isOpen);

    if (isOpen) {
      fetchSummary();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md hover:scale-105 transition">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Summary
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            AI Summary: {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 min-h-[300px] text-sm leading-relaxed text-gray-700">
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin h-4 w-4" />
              Generating professional summary...
            </div>
          )}

          {!loading && summary && (
            <div className="whitespace-pre-wrap">{summary}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
