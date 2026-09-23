/**
 * (app)/layout.tsx
 * Authenticated application shell.
 *
 * All routes inside (app)/ require a signed-in Clerk session.
 * The auth() redirect is handled here so every child page is
 * automatically protected without repeating the check.
 *
 * Layout: shadcn SidebarProvider wraps the whole shell.
 *   - <AppSidebar />  — persistent left nav (collapses to icons on narrow)
 *   - <Topbar />      — sticky top bar with page title + actions
 *   - {children}      — page content
 */

import { requireAuthPage } from "@/lib/helper/pageAuth.helper";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { OrgGateScreen } from "@/components/org-gate/org-gate-screen";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * Auth guard — if the user is not signed in, Clerk sends them to /sign-in.
   * This is the only auth logic in this file; everything else is UI.
   */
  const { orgId } = await requireAuthPage();
  if (!orgId) return <OrgGateScreen />;

  return (
    <SidebarProvider defaultOpen>
      <ChatSidebar />

      {/* Main content area */}
      <SidebarInset className="flex flex-col min-h-screen">
        {/*
         * Topbar title is static here; individual pages can replace it
         * via a future slot mechanism or layout-level context if needed.
         * For now, dashboard overrides the visual title inside its own UI.
         */}
        <Topbar
          title="Ask your documents"
          subtitle="Answers with the source in view"
        />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 flex flex-col overflow-hidden"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
