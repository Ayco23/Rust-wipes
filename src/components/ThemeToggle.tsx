"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "rw:theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle(): void {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-neutral-300 px-3 text-sm font-medium",
        "hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800",
      )}
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}

export default ThemeToggle;
