import type { ReactNode } from "react"
import { MoreVertical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  badgeVariants,
  cardVariants,
  iconVariants,
} from "@/lib/dashboard-card-variants"

type DashboardCardProps = {
  title: string
  value: string
  trend?: string
  footerText?: string
  icon: ReactNode
  cardIcon?: ReactNode
  variant?: "default" | "light"
  className?: string
}

function DashboardCard({
  title,
  value,
  trend,
  footerText = "Since last week",
  icon,
  variant = "default",
  className,
  cardIcon,
}: DashboardCardProps) {
  const trendLabel = trend?.trim()

  return (
    <div className={cn(cardVariants({ variant }), className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className={cn(iconVariants({ variant }))}>{icon}</div>

        <div className="flex items-center">
          {trendLabel ? (
            <Badge
              variant="default"
              className={cn("mr-2", badgeVariants({ variant }))}
            >
              {trendLabel.startsWith("+") || trendLabel.startsWith("-")
                ? trendLabel
                : `+${trendLabel}`}
            </Badge>
          ) : null}
          <MoreVertical size={18} />
        </div>
      </div>

      <div>
        <p
          className={cn(
            "text-xs",
            variant === "light" && "text-gray-600 dark:text-gray-400"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-2xl font-bold",
            variant === "light" && "text-gray-900 dark:text-gray-100"
          )}
        >
          {value}
        </p>
        <p
          className={cn(
            "mt-2 text-xs",
            variant === "default"
              ? "text-gray-300"
              : "text-gray-500 dark:text-gray-400"
          )}
        >
          {footerText}
        </p>
      </div>

      <div className="pointer-events-none absolute right-4 bottom-4 opacity-10">
        {cardIcon}
      </div>
    </div>
  )
}

export default DashboardCard
