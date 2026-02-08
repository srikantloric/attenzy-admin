import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import WebhookRow from "@/components/WenhookRow"

function WebhooksTab() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Webhooks</CardTitle>
        <Button size="sm">Add Webhook</Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <WebhookRow
          url="https://example.com/webhooks/device-events"
          events={["device.created", "device.updated"]}
        />

        <WebhookRow
          url="https://example.com/webhooks/audit"
          events={["device.deleted"]}
        />
      </CardContent>
    </Card>
  )
}

export default WebhooksTab
