import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/MetricCard";
import TopEndpoint from "@/components/TopEndpoint";
import { ApiRequestsChart } from "@/components/charts/ApiRequestsChart";
import { WebhookRequestsChart } from "@/components/charts/WebhookRequestChart";

function OverviewTab() {
  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Requests (30d)" value="0" />
        <MetricCard title="Error Rate" value="0.00%" />
        <MetricCard title="Active API Keys" value="0" />
        <MetricCard title="Webhooks" value="0" />
      </div>

      {/* Charts + Top Endpoints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Charts take 2 columns */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ApiRequestsChart />
          <WebhookRequestsChart />
        </div>

        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <TopEndpoint path="/api/v1/devices" count="0" />
            <TopEndpoint path="/api/v1/devices/{id}" count="0" />
            <TopEndpoint path="/api/v1/account" count="0" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OverviewTab;
