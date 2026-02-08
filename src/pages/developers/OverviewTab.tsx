import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MetricCard from "@/components/MetricCard"
import TopEndpoint from "@/components/TopEndpoint"

function OverviewTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Requests (30d)" value="1.24M" />
        <MetricCard title="Error Rate" value="0.38%" />
        <MetricCard title="Active API Keys" value="3" />
        <MetricCard title="Webhooks" value="2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>API Requests</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            Requests chart
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <TopEndpoint path="/api/v1/devices" count="540k" />
            <TopEndpoint path="/api/v1/devices/{id}" count="410k" />
            <TopEndpoint path="/api/v1/account" count="290k" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OverviewTab
