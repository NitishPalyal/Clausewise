"use client";

/**
 * topbar.tsx
 * Top navigation bar for the authenticated app shell.
 * Contains: mobile menu trigger, page title, global actions.
 */

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DarkModeToggle } from "@/components/layout/dark-mode-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface TopbarProps {
  /** Page title shown in the top bar */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4">
      {/* Mobile / collapse trigger */}
      <SidebarTrigger
        id="sidebar-trigger"
        className="-ml-1 text-muted-foreground hover:text-foreground"
        aria-label="Toggle navigation"
      />

      <Separator orientation="vertical" className="h-5" />

      {/* Page title */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-sm font-semibold text-foreground leading-none truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Help — links to docs placeholder */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              id="help-button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Help and documentation"
              onClick={() => {
                /* TODO: open help centre / documentation modal */
              }}
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Help</TooltipContent>
        </Tooltip>

        <DarkModeToggle />
      </div>
    </header>
  );
}
