"use client";

/**
 * app-sidebar.tsx
 * The persistent left navigation for the authenticated shell.
 * Uses shadcn Sidebar primitives.
 *
 * Tenant model: one Clerk Organization = one ClauseWise tenant (factory).
 * The org switcher lets a user who belongs to multiple organizations switch context.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SearchCode,
  FolderOpen,
  Settings,
  ChevronRight,
} from "lucide-react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useClerkAppearance } from "@/hooks/use-clerk-appearance";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  {
    id: "nav-dashboard",
    label: "Ask a Question",
    href: "/dashboard",
    icon: SearchCode,
    description: "Search your compliance documents",
  },
  {
    id: "nav-documents",
    label: "Documents",
    href: "/documents",
    icon: FolderOpen,
    description: "SOPs, audit reports, certificates",
  },
  {
    id: "nav-settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Organization and account settings",
  },
] as const;

export function AppSidebar() {
  const clerkAppearance = useClerkAppearance();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* ── Header: Logo ──────────────────────────────────────────────────── */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          {/* ClauseWise wordmark */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
            style={{ background: "var(--primary)" }}
            aria-hidden="true"
          >
            <SearchCode className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
              ClauseWise
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              Compliance Search
            </span>
          </div>
        </div>

        {/* Org switcher — lets a manager switch between plants / companies */}
        <div className="mt-3 group-data-[collapsible=icon]:hidden">
          <OrganizationSwitcher
            hidePersonal
            organizationProfileProps={{ appearance: clerkAppearance }}
            appearance={{
              ...clerkAppearance,
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger:
                    "w-full justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                },
            }}
          />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Main Navigation ────────────────────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                      <Link
                        id={item.id}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                        {isActive && (
                          <ChevronRight
                            className="ml-auto h-3 w-3 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* ── Footer: User ──────────────────────────────────────────────────── */}
      <SidebarFooter className="px-3 py-3">
        <UserButton
          userProfileProps={{ appearance: clerkAppearance }}
          appearance={{
            ...clerkAppearance,
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
