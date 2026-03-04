"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span className="w-8 h-8 inline-block" suppressHydrationWarning />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--hover-subtle)] text-[var(--text-muted)] hover:text-[var(--primary)]"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
