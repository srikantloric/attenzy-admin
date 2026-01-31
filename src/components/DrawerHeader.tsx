
import {
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

export function DrawerHeader() {
    const { isMobile } = useSidebar()
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                {isMobile ? <img src="./attenzy-logo-minified.png" />
                    : <img src="./attenzy-logo.png" className="h-10" />
                }
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
