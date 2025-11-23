"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LinkForm({ onSuccess }: { onSuccess?: () => void }) {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUrl = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };

  async function handleSubmit() {
    if (!validateUrl(url)) {
      toast.error("Please enter a valid URL.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, code: code.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) toast.error(data.error || "Something went wrong");
      else {
        toast.success("Short link created!");
        setUrl("");
        setCode("");
        onSuccess?.(); // refresh dashboard
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-4">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter long URL"
        className="w-full p-3 rounded border border-gray-300"
      />
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Custom code (optional)"
        className="w-full p-3 rounded border border-gray-300"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3 rounded text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Creating..." : "Create Short Link"}
      </button>
    </div>
  );
}
