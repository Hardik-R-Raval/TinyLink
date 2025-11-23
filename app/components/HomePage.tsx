"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ code: string; url: string } | null>(null);

  const codeRegex = /^[A-Za-z0-9]{6,8}$/;

  function isValidUrl(value: string) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  async function createLink() {
    setError("");
    setSuccess(null);

    if (!url.trim() || !isValidUrl(url.trim())) {
      setError("Please enter a valid URL.");
      return;
    }

    if (code.trim() && !codeRegex.test(code.trim())) {
      setError("Custom code must be 6–8 alphanumeric characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), code: code.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(data);
        setUrl("");
        setCode("");
        toast.success("Short link created!");
      }
    } catch {
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold mb-8 text-center">TinyLink</h1>

      <div className="bg-gray-800 p-6 rounded-md shadow space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Long URL</label>
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-gray-600 rounded px-3 py-2 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Custom Code (optional)</label>
          <input
            type="text"
            placeholder="6–8 alphanumeric characters"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border border-gray-600 rounded px-3 py-2 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={createLink}
          disabled={loading}
          className={`w-full py-2 rounded text-white ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"} transition`}
        >
          {loading ? "Creating..." : "Create Link"}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {success && (
          <div className="mt-4 p-3 bg-green-700 border border-green-600 rounded">
            <p className="font-semibold">Short Link Created!</p>
            <a
              href={`/${success.code}`}
              target="_blank"
              className="text-blue-400 underline break-words"
            >
              {`${window.location.origin}/${success.code}`}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
