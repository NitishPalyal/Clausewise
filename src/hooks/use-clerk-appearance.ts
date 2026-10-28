"use client";

import { useEffect, useState } from "react";
import { getClerkAppearance } from "@/lib/clerk-appearance";

export function useClerkAppearance() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDark(root.classList.contains("dark"));

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return getClerkAppearance(isDark);
}
