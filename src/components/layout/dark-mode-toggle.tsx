"use client";

/**
 * dark-mode-toggle.tsx
 * Persists the user's light/dark preference in localStorage.
 * Light mode is the primary experience for this app — factory offices
 * are bright, and paper-audit culture favours light UIs.
 */

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      const saved = localStorage.getItem("cw-theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("cw-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("cw-theme", "light");
    }
  };

  // Avoid hydration mismatch — render nothing on server
  if (!mounted) return null;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          id="dark-mode-toggle"
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          {isDark ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isDark ? "Light mode" : "Dark mode"}
      </TooltipContent>
    </Tooltip>
  );
}
