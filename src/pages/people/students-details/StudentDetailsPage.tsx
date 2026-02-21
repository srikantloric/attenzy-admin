import { AppBreadcrumb } from "@/components/AppBreadCrumb"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Fingerprint, User } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"


function StudentsDetailsPage() {

    const navigate = useNavigate()
    const { pathname } = useLocation()

    const tab = pathname.split("/")[3] ?? "profile"


    return (
        <div className="space-y-6 p-6">
            <AppBreadcrumb />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">
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
                        defaultValue="profile" >
                        <TabsList variant={"line"}>
                            <TabsTrigger value="profile">
                                <User />Profile
                            </TabsTrigger>
                            <TabsTrigger value="attendance">
                                <Fingerprint />Attendance
                            </TabsTrigger>
                            {/* <TabsTrigger value="alerts">
                                <CircleAlert />Alerts
                            </TabsTrigger>
                            <TabsTrigger value="config">
                                <Settings />Settings
                            </TabsTrigger> */}
                        </TabsList>
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