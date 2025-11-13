"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" min-h-screen flex ">
      <SidebarProvider>
        <div className="">
          <AppSidebar />
        </div>
        <SidebarInset className=" w-full flex-1">{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
