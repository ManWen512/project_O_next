"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconCrown,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useGetPendingFriendsQuery } from "@/services/friends";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

const data = {
  navMain: [
    {
      title: "Feeds",
      url: "/feeds",
      icon: IconDashboard,
    },
    {
      title: "Friends",
      url: "/friends",
      icon: IconListDetails,
    },
    {
      title: "My Feeds",
      url: "/myFeeds",
      icon: IconChartBar,
    },
    {
      title: "O Chat",
      url: "/oChat",
      icon: IconCrown,
    },
    {
      title: "Settings",
      url: "/setting",
      icon: IconSettings,
    },

    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { data: pendingUsers } = useGetPendingFriendsQuery();

  const pendingCount = pendingUsers?.length ?? 0;

  const navWithNotifications = data.navMain.map((item) =>
    item.title === "Friends"
      ? { ...item, notification: pendingCount > 0 }
      : item
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/feeds">
                <div className="text-2xl font-bold  font-quicksand z-50">
                  Project{" "}
                  <img
                    src="/logo.PNG"
                    alt="Logo"
                    className="inline h-12 w-12 -ml-3 mb-1"
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navWithNotifications} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user as User} />
      </SidebarFooter>
    </Sidebar>
  );
}
