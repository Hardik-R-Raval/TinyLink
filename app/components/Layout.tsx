"use client";

import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-gray-100 px-4 py-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">TinyLink</h1>
          <nav className="space-x-4">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-sm">
          &copy; {new Date().getFullYear()} TinyLink. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
