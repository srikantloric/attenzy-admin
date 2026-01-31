
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import AuthGuard from "@/utils/route-guard/AuthGuard"
import { Outlet } from "react-router-dom"
import { Drawer } from "./Drawer/Drawer"
import AppBar from "./Header"
import { Separator } from "@/components/ui/separator"

function MainLayout() {
    return (
        <AuthGuard>
            <SidebarProvider>
                <div className="flex w-full">
                    {/* Sidebar */}
                    <Drawer />
                    {/* Main Content */}
                    <SidebarInset>
                        {/* App Bar */}
                        <AppBar />
                        <Separator />
                        {/* Page Content */}
                        <main className="flex-1 overflow-y-auto p-4">
                            <Outlet />
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </AuthGuard>
    )
}

export default MainLayout