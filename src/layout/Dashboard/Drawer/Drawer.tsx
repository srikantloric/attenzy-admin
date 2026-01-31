

import * as React from "react"

import { NavUser } from "@/components/nav-user"
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
import menuItems from "@/menu-items"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DrawerHeader } from "@/components/DrawerHeader"

export function Drawer({ ...props }: React.ComponentProps<typeof Sidebar>) {


    return (
        <Sidebar collapsible="icon" {...props} >
            <SidebarHeader>
                <DrawerHeader />
            </SidebarHeader>
            <SidebarContent>
                {menuItems.items.map((group) => {
                    if (group.type !== "group") return null

                    return (
                        <SidebarGroup key={group.id}>
                            {/* 🔹 Group label */}
                            {group.title && (
                                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                            )}

                            <SidebarMenu>
                                {group.children?.map((item) => {
                                    // ---------------------------
                                    // COLLAPSIBLE MENU
                                    // ---------------------------
                                    if (item.type === "collapse") {
                                        const Icon = item.icon as LucideIcon | undefined

                                        return (
                                            <Collapsible
                                                key={item.id}
                                                asChild
                                                defaultOpen={item.isDropdown}
                                                className="group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton tooltip={item.title}>
                                                            {Icon && <Icon />}
                                                            <span>{item.title}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.children?.map((subItem) => (
                                                                <SidebarMenuSubItem key={subItem.id}>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                    // disabled={subItem.disabled}
                                                                    >
                                                                        <a
                                                                            href={subItem.url}
                                                                            target={subItem.target ? "_blank" : "_self"}
                                                                        >
                                                                            <span>{subItem.title}</span>
                                                                        </a>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        )
                                    }

                                    // ---------------------------
                                    // SINGLE MENU ITEM
                                    // ---------------------------
                                    if (item.type === "item") {
                                        const Icon = item.icon as LucideIcon | undefined

                                        return (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    asChild
                                                    tooltip={item.title}
                                                    disabled={item.disabled}
                                                >
                                                    <a
                                                        href={item.url}
                                                        target={item.target ? "_blank" : "_self"}
                                                    >
                                                        {Icon && <Icon />}
                                                        <span>{item.title}</span>
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
            <SidebarFooter>
                <NavUser
                    user={{
                        name: "Wave International School",
                        email: "srikantloric@gmail.com",
                        avatar: "https://www.waveinternationalschool.org/_next/image/?url=%2Fwave-logo.png&w=64&q=75"
                    }} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
