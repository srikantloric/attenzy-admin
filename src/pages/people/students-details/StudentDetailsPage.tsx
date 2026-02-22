import { AppBreadcrumb } from "@/components/AppBreadCrumb"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CircleAlert, Fingerprint, Settings, User } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"


function StudentsDetailsPage() {

    const navigate = useNavigate()
    const { pathname } = useLocation()

    const tab = pathname.split("/")[3] ?? "profile"


    return (
        <div className="space-y-6 p-1 sm:p-2 md:p-3 lg:p-6">
            <AppBreadcrumb />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-md lg:text-2xl font-semibold">
                        Students Details
                    </h1>
                </div>
            </div>

            <div className="flex flex-col gap-3 border rounded-2xl p-3">
                <div>
                    <Tabs
                        value={tab}
                        onValueChange={(value) =>
                            navigate(value === "profile" ? "." : value)
                        }
                        className="space-y-4"
                        defaultValue="profile"
                    >
                        {/* Scroll on mobile */}
                        <ScrollArea className="w-full">
                            <TabsList
                                variant="line"
                                className="
        flex w-max min-w-full gap-1
        overflow-x-auto
        sm:w-auto sm:min-w-0
      "
                            >
                                <TabsTrigger
                                    value="profile"
                                    className="flex items-center gap-2 px-3 sm:px-4"
                                >
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline">Profile</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="attendance"
                                    className="flex items-center gap-2 px-3 sm:px-4"
                                >
                                    <Fingerprint className="h-4 w-4" />
                                    <span className="hidden sm:inline">Attendance</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="alerts"
                                    className="flex items-center gap-2 px-3 sm:px-4"
                                >
                                    <CircleAlert className="h-4 w-4" />
                                    <span className="hidden sm:inline">Alerts</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="config"
                                    className="flex items-center gap-2 px-3 sm:px-4"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Settings</span>
                                </TabsTrigger>
                            </TabsList>
                        </ScrollArea>
                    </Tabs>

                    <Separator />
                </div>
                <div className="min-h-112.5">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default StudentsDetailsPage