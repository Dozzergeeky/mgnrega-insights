"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ThemeVariant = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeVariant | null>(null);

  useEffect(() => {
    // Only run on client
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  useEffect(() => {
    if (theme === null) return;
    
    window.localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  // Don't render until we know the theme on client
  if (theme === null) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        aria-label="Toggle theme"
        disabled
      >
        <span className="text-xl opacity-0">🌙</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      <span className="text-xl" suppressHydrationWarning>
        {theme === "light" ? "🌙" : "☀️"}
      </span>
    </Button>
  );
}
