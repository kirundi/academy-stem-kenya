"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Solutions", href: "/#solutions" },
  { label: "Curriculum", href: "/#curriculum" },
  { label: "Educators", href: "/educators" },
  { label: "Challenges", href: "/challenges" },
  { label: "About Us", href: "/about" },
  { label: "Help", href: "/help" },
  { label: "Contact", href: "/contact" },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-(--border) bg-(--bg-sidebar)/90 backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="outline-none focus:ring-2 focus:ring-[#13daec] rounded-lg inline-flex">
          <span className="bg-white rounded-lg px-3 py-1.5 inline-flex items-center">
            <Image
              src="/images/logo/sic-academy.png"
              alt="STEM Impact Academy"
              height={36}
              width={180}
              style={{ height: "36px", width: "auto" }}
              priority
            />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-(--text-muted) hover:text-[#13daec] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 text-(--text-muted) hover:text-[#13daec] transition-colors"
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
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-(--text-muted) hover:text-[#13daec] transition-colors p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-(--border) bg-(--bg-sidebar) px-4 py-4 space-y-2 mt-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2.5 text-(--text-muted) font-medium text-sm hover:text-[#13daec] hover:bg-(--hover-subtle) rounded-lg transition-all"
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
