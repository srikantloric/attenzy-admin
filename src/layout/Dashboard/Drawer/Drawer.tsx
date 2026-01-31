import * as React from "react"
import { useLocation } from "react-router-dom"
import { ChevronRight, type LucideIcon } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { DrawerHeader } from "@/components/DrawerHeader"
import menuItems from "@/menu-items"

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
} from "@/components/ui/sidebar"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function Drawer(props: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation()
    const pathname = location.pathname

    // 🔹 Route matcher
    const isActiveRoute = (url?: string) => {
        if (!url) return false
        return pathname === url || pathname.startsWith(url + "/")
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* ---------------- Header ---------------- */}
            <SidebarHeader>
                <DrawerHeader />
            </SidebarHeader>

            {/* ---------------- Content ---------------- */}
            <SidebarContent>
                {menuItems.items.map((group) => {
                    if (group.type !== "group") return null

                    return (
                        <SidebarGroup key={group.id}>
                            {group.title && (
                                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                            )}

                            <SidebarMenu>
                                {group.children?.map((item) => {
                                    /* ===============================
                                       COLLAPSIBLE MENU
                                    =============================== */
                                    if (item.type === "collapse") {
                                        const Icon = item.icon as LucideIcon | undefined

                                        const hasActiveChild = item.children?.some((child) =>
                                            isActiveRoute(child.url)
                                        )

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
                                                            className="cursor-pointer [&>svg]:h-5 [&>svg]:w-5"
                                                        >
                                                            {Icon && <Icon className="h-5 w-5" />}
                                                            <span className="text-[16px]">
                                                                {item.title}
                                                            </span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.children?.map((subItem) => {
                                                                const isSubActive = isActiveRoute(subItem.url)

                                                                return (
                                                                    <SidebarMenuSubItem key={subItem.id}>
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                            isActive={isSubActive}
                                                                            className="cursor-pointer [&>svg]:h-5 [&>svg]:w-5"
                                                                        >
                                                                            <a
                                                                                href={subItem.url}
                                                                                target={
                                                                                    subItem.target ? "_blank" : "_self"
                                                                                }
                                                                            >
                                                                                <span className="text-[16px]">
                                                                                    {subItem.title}
                                                                                </span>
                                                                            </a>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                )
                                                            })}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        )
                                    }

                                    /* ===============================
                                       SINGLE MENU ITEM
                                    =============================== */
                                    if (item.type === "item") {
                                        const Icon = item.icon as LucideIcon | undefined
                                        const isActive = isActiveRoute(item.url)

                                        return (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    asChild
                                                    tooltip={item.title}
                                                    disabled={item.disabled}
                                                    isActive={isActive}
                                                    className="cursor-pointer [&>svg]:h-5 [&>svg]:w-5"
                                                >
                                                    <a
                                                        href={item.url}
                                                        target={item.target ? "_blank" : "_self"}
                                                    >
                                                        {Icon && <Icon />}
                                                        <span className="text-[16px]">
                                                            {item.title}
                                                        </span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    }

                                    return null
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                    )
                })}
            </SidebarContent>

            {/* ---------------- Footer ---------------- */}
            <SidebarFooter>
                <NavUser
                    user={{
                        name: "Wave International School",
                        email: "srikantloric@gmail.com",
                        avatar:
                            "https://www.waveinternationalschool.org/_next/image/?url=%2Fwave-logo.png&w=64&q=75",
                    }}
                />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
