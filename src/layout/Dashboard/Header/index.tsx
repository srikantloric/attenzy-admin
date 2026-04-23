import { CommandSearch } from "@/components/CommandSearch";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import { Bell, Radio } from "lucide-react";
import { toast } from "sonner";

const getStageLabel = () => {
  const explicitStage =
    import.meta.env.VITE_STAGE || import.meta.env.VITE_APP_STAGE;

  if (explicitStage) {
    return String(explicitStage).toUpperCase();
  }

  const mode = import.meta.env.MODE;
  if (mode === "development") {
    return "DEV";
  }
  if (mode === "production") {
    const backendUrl = String(
      import.meta.env.VITE_BACKEND_BASE_URL || "",
    ).toLowerCase();

    if (backendUrl.includes("staging") || backendUrl.includes("stage")) {
      return "STAGE";
    }
    if (backendUrl.includes("dev") || backendUrl.includes("localhost")) {
      return "DEV";
    }

    return "PROD";
  }

  return String(mode || "LOCAL").toUpperCase();
};

function AppBar() {
  const { user, logout } = useAuth();
  console.log(user);
  const isMobile = useIsMobile();
  const stageLabel = getStageLabel();

  const handleLiveFeed = () => {
    if (user && user.orgId) {
      (window as any).AttenzyWidget?.boot({
        publicKey: "dev-secret-change-me",
        externalOrgId: user.orgId,
        sessionUrl: "https://rp5oivx0vb.execute-api.ap-south-1.amazonaws.com",
        wsUrl: "wss://7j4ipogn88.execute-api.ap-south-1.amazonaws.com/dev",
      });
    } else {
      toast.error("You must be logged in to access the live feed.");
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex items-center px-6 py-2 justify-between">
        <div className="flex items-center">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          {!isMobile && <CommandSearch />}
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary">{stageLabel}</Badge>

          {!isMobile && <Badge variant={"outline"}>{user?.role}</Badge>}

          <Button variant={"outline"} onClick={handleLiveFeed}>
            <Radio />
            IoT
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
  );
}

export default AppBar;
