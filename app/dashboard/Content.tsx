"use client";

import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";

type LinkType = {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
};

type SortField = "code" | "clicks" | "createdAt";
type SortDirection = "asc" | "desc";

export default function DashboardContent() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  useEffect(() => {
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => setLinks(data))
      .catch(() => setError("Failed to load links"))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setLinks((prev) => prev.filter((l) => l.code !== code));
      toast.success("Link deleted successfully!");
    } catch {
      toast.error("Failed to delete link.");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredLinks = useMemo(() => {
    let filtered = links;
    if (filter) {
      filtered = filtered.filter(
        (l) =>
          l.code.toLowerCase().includes(filter.toLowerCase()) ||
          l.url.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case "code":
          aVal = a.code.toLowerCase();
          bVal = b.code.toLowerCase();
          break;
        case "clicks":
          aVal = a.clicks;
          bVal = b.clicks;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [links, filter, sortField, sortDir]);

  if (loading) return <p className="text-center text-gray-400 mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (links.length === 0)
    return <p className="text-center text-gray-400 mt-10">No links found.</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6 text-center">All Short Links</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by code or URL..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 rounded border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-700 text-gray-200">
              <th
                className={`border px-4 py-2 cursor-pointer ${
                  sortField === "code" ? "bg-gray-600 font-semibold" : ""
                }`}
                onClick={() => handleSort("code")}
              >
                Code {sortDir === "asc" ? "▲" : "▼"}
              </th>
              <th className="border px-4 py-2">URL</th>
              <th
                className={`border px-4 py-2 cursor-pointer ${
                  sortField === "clicks" ? "bg-gray-600 font-semibold" : ""
                }`}
                onClick={() => handleSort("clicks")}
              >
                Clicks {sortDir === "asc" ? "▲" : "▼"}
              </th>
              <th
                className={`border px-4 py-2 cursor-pointer ${
                  sortField === "createdAt" ? "bg-gray-600 font-semibold" : ""
                }`}
                onClick={() => handleSort("createdAt")}
              >
                Created {sortDir === "asc" ? "▲" : "▼"}
              </th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.map((link) => (
              <tr key={link.code} className="hover:bg-gray-800">
                <td className="border px-4 py-2 font-mono">{link.code}</td>
                <td className="border px-4 py-2 truncate max-w-xs" title={link.url}>{link.url}</td>
                <td className="border px-4 py-2">{link.clicks}</td>
                <td className="border px-4 py-2">{new Date(link.createdAt).toLocaleDateString()}</td>
                <td className="border px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleCopy(`${window.location.origin}/${link.code}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(link.code)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
