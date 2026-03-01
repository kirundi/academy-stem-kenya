"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Solutions", href: "/#solutions" },
  { label: "Curriculum", href: "/#curriculum" },
  { label: "About Us", href: "/about" },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#283739] bg-[rgba(16,32,34,0.8)] backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-[#13daec]">token</span>
          <span className="text-xl font-bold tracking-tight text-slate-100 uppercase italic">
            STEM Impact <span className="text-[#ff4d4d]">Academy</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium hover:text-[#13daec] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 hover:text-[#13daec] transition-colors"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-[#13daec] px-6 py-2 text-sm font-bold text-[#102022] hover:brightness-110 transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-300 hover:text-[#13daec] transition-colors p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#283739] bg-[#0d1f22] px-4 py-4 space-y-2 mt-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2.5 text-slate-300 font-medium text-sm hover:text-[#13daec] hover:bg-[rgba(19,218,236,0.06)] rounded-lg transition-all"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 pb-1 flex flex-col gap-2">
            <Link
              href="/login"
              className="block text-center bg-[#13daec] text-[#102022] font-bold py-3 rounded-lg text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
