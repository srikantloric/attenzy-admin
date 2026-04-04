import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { DrawerHeader } from "@/components/DrawerHeader";
import menuItems from "@/menu-items";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import useAuth from "@/hooks/useAuth";
import { filterMenuByRole } from "@/utils/filterMenuByRole";

export function Drawer(props: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const { state } = useSidebar();

  const isActiveRoute = (url?: string) => {
    if (!url) return false;
    return pathname === url || pathname.startsWith(url + "/");
  };

  const filteredMenu = filterMenuByRole(menuItems.items, user?.role!);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader>
        <DrawerHeader />
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="mt-3">
        {filteredMenu.map((group) => {
          if (group.type !== "group") return null;

          return (
            <SidebarGroup key={group.id}>
              {group.title && (
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              )}

              <SidebarMenu>
                {group.children?.map((item) => {
                  /* ==================================
                                       COLLAPSIBLE MENU
                                    ================================== */

                  if (item.type === "collapse") {
                    const Icon = item.icon as LucideIcon | undefined;

                    const hasActiveChild = item.children?.some((child) =>
                      isActiveRoute(child.url),
                    );

                    /* ---------- COLLAPSED SIDEBAR ---------- */

                    if (state === "collapsed") {
                      return (
                        <HoverCard key={item.id} openDelay={0} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <SidebarMenuItem>
                              <SidebarMenuButton
                                // tooltip={item.title}
                                isActive={hasActiveChild}
                                className="cursor-pointer [&>svg]:h-5 [&>svg]:w-5"
                              >
                                {Icon && <Icon className="h-5 w-5" />}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </HoverCardTrigger>

                          <HoverCardContent
                            side="right"
                            align="start"
                            className="w-48 p-1 bg-white dark:bg-neutral-900 shadow-lg"
                          >
                            <SidebarMenuSub className="border-l-0">
                              {item.children?.map((subItem) => {
                                const isSubActive = isActiveRoute(subItem.url);

                                return (
                                  <SidebarMenuSubItem key={subItem.id}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isSubActive}
                                    >
                                      <Link to={subItem.url!}>
                                        {subItem.title}
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    }

                    /* ---------- EXPANDED SIDEBAR ---------- */

                    return (
                      <Collapsible
                        key={item.id}
                        asChild
                        defaultOpen={hasActiveChild}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={hasActiveChild}
                              className="cursor-pointer [&>svg]:h-5 [&>svg]:w-5  hover:bg-primary/20 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                            >
                              {Icon && <Icon className="h-5 w-5" />}

                              <span className="text-[16px]">{item.title}</span>

                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children?.map((subItem) => {
                                const isSubActive = isActiveRoute(subItem.url);

                                return (
                                  <SidebarMenuSubItem key={subItem.id}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isSubActive}
                                      className="cursor-pointer text-muted hover:text-primary hover:bg-transparent data-[active=true]:bg-transparent data-[active=true]:text-primary"
                                    >
                                      <Link to={subItem.url!}>
                                        <span className="text-[16px]">
                                          {subItem.title}
                                        </span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  /* ==================================
                                       SINGLE MENU ITEM
                                    ================================== */

                  if (item.type === "item") {
                    const Icon = item.icon as LucideIcon | undefined;
                    const isActive = isActiveRoute(item.url);

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          disabled={item.disabled}
                          isActive={isActive}
                          size={"default"}
                          className="cursor-pointer [&>svg]:h-5 [&>svg]:w-5 data-[active=true]:bg-primary hover:bg-primary/20 hover:text-white data-[active=true]:text-primary-foreground"
                        >
                          <Link to={item.url!}>
                            {Icon && <Icon />}

                            <span className="text-[16px]">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return null;
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Footer */}

      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            avatar:
              "https://png.pngtree.com/png-vector/20240528/ourmid/pngtree-indian-doctor-woman-smiling-at-camera-png-image_12531120.png",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
