"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    notification?: boolean;
  }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleClick = (url: string) => {
    router.push(url);
    setOpenMobile(false);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => handleClick(item.url)}
                  className={`flex items-center gap-2 transition-colors justify-between
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="w-4 h-4 mr-2"/>}
                    <span> {item.title}</span>
                  </div>
                  {item.notification && (
                    <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
