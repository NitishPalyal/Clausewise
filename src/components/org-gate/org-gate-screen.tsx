"use client";

import { CreateOrganization, OrganizationList } from "@clerk/nextjs";
import { Building2, UsersRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OrgGateScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper p-4">
      <div className="absolute inset-0 grid grid-cols-12 gap-3 p-4 opacity-40">
        <Skeleton className="col-span-2 h-full rounded-none" />
        <div className="col-span-10 space-y-5 pt-20">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-20 w-1/2" />
        </div>
      </div>
      <Card className="relative z-10 w-full max-w-lg rounded-none border-ink/15 bg-white shadow-[10px_10px_0_#d7dddc]">
        <CardHeader>
          <p className="font-mono text-xs text-steel">ONE LAST STEP</p>
          <CardTitle className="mt-2 text-2xl text-ink">
            Set up your organization
          </CardTitle>
          <CardDescription className="text-ink/60">
            ClauseWise keeps each company&apos;s documents and answers separate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="join">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join">
                <UsersRound className="size-4" /> Join an organization
              </TabsTrigger>
              <TabsTrigger value="create">
                <Building2 className="size-4" /> Create one
              </TabsTrigger>
            </TabsList>
            <TabsContent value="join" className="pt-6">
              <OrganizationList
                hidePersonal
                afterSelectOrganizationUrl="/dashboard"
                appearance={{
                  elements: {
                    card: "w-full shadow-none border-0",
                    headerTitle: "text-ink",
                    headerSubtitle: "text-muted-foreground",
                  },
                }}
              />
            </TabsContent>
            <TabsContent value="create" className="pt-6">
              <CreateOrganization
                afterCreateOrganizationUrl="/dashboard"
                appearance={{
                  elements: {
                    card: "w-full shadow-none border-0",
                    headerTitle: "text-ink",
                    headerSubtitle: "text-muted-foreground",
                  },
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
