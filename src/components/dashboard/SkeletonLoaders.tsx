import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex gap-4">
            {Array(7)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={`header-${i}`} className="h-4 flex-1" />
              ))}
          </div>
          {/* Data rows */}
          {Array(7)
            .fill(0)
            .map((_, rowIdx) => (
              <div key={`row-${rowIdx}`} className="flex gap-4">
                {Array(7)
                  .fill(0)
                  .map((_, colIdx) => (
                    <Skeleton
                      key={`cell-${rowIdx}-${colIdx}`}
                      className="h-4 flex-1"
                    />
                  ))}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AlertCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-3 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <div key={`alert-${i}`} className="space-y-2 rounded-md border p-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={`notif-${i}`}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 p-2 lg:p-6 md:p-3">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-40" />

      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
      </div>

      {/* Main grid layout */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 lg:col-span-9">
          {/* Top metric cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <DashboardCardSkeleton key={`card-${i}`} />
              ))}
          </div>

          {/* Attendance trend chart */}
          <ChartSkeleton />

          {/* Intraday and pie charts */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <ChartSkeleton />
            </div>
            <ChartSkeleton />
          </div>

          {/* Table */}
          <TableSkeleton />

          {/* Status distribution chart */}
          <ChartSkeleton />
        </div>

        {/* Sidebar */}
        <div className="min-w-0 space-y-4 lg:col-span-3">
          <AlertCardSkeleton />
          <NotificationCardSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    </div>
  );
}
