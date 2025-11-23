"use client";

import { useState } from "react";

export function LinkActions({ code }: { code: string }) {
  const [loading, setLoading] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    alert("Copied to clipboard!");
  };

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this link?")) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/links/${code}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete the link.");
      } else {
        alert("Link deleted successfully.");
        window.location.reload(); // Refresh the page after deletion
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 md:mt-0 flex space-x-2">
      <button
        type="button"
        onClick={copyToClipboard}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Copy
      </button>
      <form onSubmit={handleDelete}>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </form>
    </div>
  );
}
