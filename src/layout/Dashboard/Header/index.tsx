import { CommandSearch } from "@/components/CommandSearch"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import useAuth from "@/hooks/useAuth"
import { Bell, Radio } from "lucide-react"


function AppBar() {
    const { user, logout } = useAuth()
    console.log(user)
    const isMobile = useIsMobile()


    const handleLiveFeed = () => {
        (window as any).AttenzyWidget?.boot({
            publicKey: "pk_test_123",
            externalOrgId: "ATT-O-898892",
            sessionUrl: "https://4qzf491261.execute-api.ap-south-1.amazonaws.com",
            wsUrl: "wss://r5ixagc6t3.execute-api.ap-south-1.amazonaws.com/prod"
        });
    }

    return (
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="flex items-center px-6 py-2 justify-between">
                <div className="flex items-center">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    {!isMobile
                        &&
                        <CommandSearch />
                    }
                </div>

                <div className="flex items-center gap-3">
                    {
                        !isMobile &&
                        <Badge variant={"outline"}>{user?.role}</Badge>
                    }

                    <Button variant={"outline"} onClick={handleLiveFeed}>
                        <Radio />IoT
                    </Button>

                    <ModeToggle />

                    <Button variant="outline" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Avatar>
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="shadcn"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-32" align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Billing</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={logout}>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}


export default AppBar