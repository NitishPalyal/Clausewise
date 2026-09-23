"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  ChevronDown,
  FileText,
  MoreHorizontal,
  Plus,
  RotateCcw,
  SearchCode,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  getChatSessions,
  type ChatSession,
} from "@/lib/mock-data/chat-sessions";

export function ChatSidebar() {
  const [sessions, setSessions] = useState(getChatSessions);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const active = sessions.filter((session) => session.status === "active");
  const archived = sessions.filter((session) => session.status === "archived");

  const updateStatus = (id: string, status: ChatSession["status"]) =>
    setSessions((current) =>
      current.map((session) =>
        session.id === id ? { ...session, status } : session,
      ),
    );
  const removeSession = (id: string) =>
    setSessions((current) => current.filter((session) => session.id !== id));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-4 px-3 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
            <SearchCode className="size-4" />
          </span>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-ink">ClauseWise</p>
            <p className="text-[11px] text-muted-foreground">
              Evidence, at your fingertips
            </p>
          </div>
        </div>
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full justify-between rounded-md border border-border px-3 py-2 text-sm",
            },
          }}
        />
        <Button
          render={<Link href="/dashboard" />}
          className="w-full justify-start gap-2 bg-steel text-white hover:bg-steel/90 group-data-[collapsible=icon]:px-2"
        >
          <Plus className="size-4" />{" "}
          <span className="group-data-[collapsible=icon]:hidden">New chat</span>
        </Button>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SessionGroup
          label="Today"
          sessions={active.filter((session) => session.updatedAt === "Today")}
          onArchive={(id) => updateStatus(id, "archived")}
          onDelete={removeSession}
        />
        <SessionGroup
          label="Previous 7 days"
          sessions={active.filter(
            (session) => session.updatedAt === "Yesterday",
          )}
          onArchive={(id) => updateStatus(id, "archived")}
          onDelete={removeSession}
        />
        <SessionGroup
          label="Previous 30 days"
          sessions={active.filter(
            (session) =>
              session.updatedAt !== "Today" &&
              session.updatedAt !== "Yesterday",
          )}
          onArchive={(id) => updateStatus(id, "archived")}
          onDelete={removeSession}
        />
        <SidebarGroup>
          <button
            type="button"
            onClick={() => setArchivedOpen((open) => !open)}
            className="flex w-full items-center gap-2 px-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Archive className="size-3.5" /> Archived{" "}
            <ChevronDown
              className={
                archivedOpen
                  ? "ml-auto size-3.5 rotate-180"
                  : "ml-auto size-3.5"
              }
            />
          </button>
          {archivedOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {archived.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton
                      render={<Link href={`/dashboard/${session.id}`} />}
                      tooltip={session.title}
                    >
                      <FileText className="size-4" />
                      <span className="truncate">{session.title}</span>
                    </SidebarMenuButton>
                    <div className="hidden group-hover:flex group-focus-within:flex absolute right-1 top-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Restore ${session.title}`}
                        onClick={() => updateStatus(session.id, "active")}
                      >
                        <RotateCcw className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Delete ${session.title}`}
                        onClick={() => removeSession(session.id)}
                      >
                        <Trash2 className="size-3 text-alert" />
                      </Button>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-3">
        <div className="flex items-center gap-2">
          <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium text-foreground">
              Quality Manager
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Sharma Textiles Pvt. Ltd.
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function SessionGroup({
  label,
  sessions,
  onArchive,
  onDelete,
}: {
  label: string;
  sessions: ChatSession[];
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!sessions.length) return null;
  return (
    <SidebarGroup>
      <p className="px-2 py-2 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
      <SidebarGroupContent>
        <SidebarMenu>
          {sessions.map((session) => (
            <SidebarMenuItem key={session.id} className="group/item relative">
              <SidebarMenuButton
                render={<Link href={`/dashboard/${session.id}`} />}
                tooltip={session.title}
              >
                <FileText className="size-4" />
                <span className="truncate">{session.title}</span>
              </SidebarMenuButton>
              <div className="absolute right-1 top-1 hidden group-hover/item:flex group-focus-within/item:flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`More actions for ${session.title}`}
                  title="More actions"
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Archive ${session.title}`}
                  title="Archive"
                  onClick={() => onArchive(session.id)}
                >
                  <Archive className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Delete ${session.title}`}
                  title="Delete"
                  onClick={() => onDelete(session.id)}
                >
                  <Trash2 className="size-3 text-alert" />
                </Button>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
