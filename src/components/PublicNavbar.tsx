"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Solutions", href: "#solutions" },
  { label: "Curriculum", href: "#curriculum" },
  { label: "About Us", href: "#about" },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(19,236,164,0.1)] bg-[rgba(16,34,28,0.7)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#13eca4]">token</span>
            <span className="text-base font-black tracking-tight text-slate-100 uppercase italic">
              STEM <span className="text-[#ff4d4d]">Impact</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-400 text-sm font-medium hover:text-[#13eca4] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-slate-300 text-sm font-semibold hover:text-[#13eca4] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-[#13eca4] text-[#10221c] text-sm font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(19,236,164,0.25)]"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-slate-300 hover:text-[#13eca4] transition-colors p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(19,236,164,0.1)] bg-[#0d1f1a] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2.5 text-slate-300 font-medium text-sm hover:text-[#13eca4] hover:bg-[rgba(19,236,164,0.06)] rounded-lg transition-all"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 pb-1 flex flex-col gap-2">
            <Link
              href="/login"
              className="block text-center bg-[#13eca4] text-[#10221c] font-bold py-3 rounded-lg text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
