import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Button } from "@/components/ui/button"
import { TvMinimalPlay } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AppBreadcrumb } from "@/components/AppBreadCrumb"

import { Outlet, useLocation, useNavigate } from "react-router-dom"

function DevelopersPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const tab = pathname.split("/")[2] ?? "overview"

  return (
    <div className="p-4 space-y-4">
      <AppBreadcrumb />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Developers</h1>
          <p className="text-sm text-muted-foreground">
            Monitor usage, manage API keys, configure webhooks, and explore APIs
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-red-400"
            >
              <TvMinimalPlay className="text-red-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Video Tutorial</TooltipContent>
        </Tooltip>
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(value) =>
          navigate(value === "overview" ? "." : value)
        }
        className="space-y-4"
      >
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/* <TabsTrigger value="keys">API Keys</TabsTrigger> */}
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          {/* <TabsTrigger value="apis">API Reference</TabsTrigger> */}
        </TabsList>

        <Outlet />
      </Tabs>
    </div>
  )
}

export default DevelopersPage
