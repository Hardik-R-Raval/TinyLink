"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface LinkCardProps {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  refresh: () => void;
}

export default function LinkCard({ code, url, clicks, createdAt, refresh }: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      const res = await fetch(`/api/links/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _method: "DELETE" }),
      });
      if (res.ok) refresh();
    } catch {
      toast.error("Failed to delete link");
    }
  };

  return (
    <div className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition bg-white">
      <div className="flex-1 min-w-0">
        <p className="font-mono text-lg break-words">{code}</p>
        <p className="text-sm text-gray-600 truncate" title={url}>{url}</p>
        <p className="text-xs text-gray-400 mt-1">
          Clicks: {clicks} | Created: {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-3 md:mt-0 flex space-x-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
