"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, FolderOpen, Plus, SearchCode } from "lucide-react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
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
import type { APIResponse } from "@/shared/types";

interface ChatSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export function ChatSidebar() {
  const clerkAppearance = useClerkAppearance();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChats() {
      try {
        const response = await fetch("/api/chat/getChats", {
          signal: controller.signal,
        });
        const result: APIResponse<{ chats: ChatSummary[] }> =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load chats.");
        }
        setChats(result.data.chats);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load chats.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadChats();
    window.addEventListener("clausewise:chats-updated", loadChats);
    return () => {
      controller.abort();
      window.removeEventListener("clausewise:chats-updated", loadChats);
    };
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-4 px-3 py-4">
        <div className="flex items-center gap-2.5">
          <span           className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <SearchCode className="size-4" />
          </span>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-foreground">ClauseWise</p>
            <p className="text-[11px] text-muted-foreground">
              Evidence, at your fingertips
            </p>
          </div>
        </div>
        <OrganizationSwitcher
          hidePersonal
          organizationProfileProps={{ appearance: clerkAppearance }}
          appearance={{
            ...clerkAppearance,
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground",
            },
          }}
        />
        <Button
          render={<Link href="/dashboard" />}
          nativeButton={false}
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 group-data-[collapsible=icon]:px-2"
        >
          <Plus className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">New chat</span>
        </Button>
        <Button
          render={<Link href="/documents" />}
          nativeButton={false}
          variant="outline"
          className="w-full justify-start gap-2 group-data-[collapsible=icon]:px-2"
        >
          <FolderOpen className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            Documents
          </span>
        </Button>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {isLoading ? (
              <p className="px-3 py-4 text-sm text-muted-foreground" role="status">
                Loading chats…
              </p>
            ) : error ? (
              <p className="px-3 py-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : chats.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                No chats yet.
              </p>
            ) : (
              <SidebarMenu>
                {chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      render={<Link href={`/dashboard/${chat.id}`} />}
                      tooltip={chat.title}
                    >
                      <FileText className="size-4" />
                      <span className="truncate">{chat.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-3">
        <UserButton
          userProfileProps={{ appearance: clerkAppearance }}
          appearance={{
            ...clerkAppearance,
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
