import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { listWebhooks } from "@/api/webhook"
import type { Webhook } from "@/types/webhook"

import WebhookRow from "@/components/webhooks/WebhookRow"
import AddWebhookModal from "@/components/webhooks/AddWebhookModal"
import EditWebhookModal from "@/components/webhooks/EditWebhookModal"
import useAuth from "@/hooks/useAuth"

function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)

  const { user } = useAuth()

  /* ---------------- Fetch webhooks ---------------- */

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const res = await listWebhooks()
      setWebhooks(res.items)
    } catch (err) {
      console.error("Failed to load webhooks", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWebhooks()
  }, [])

  /* ---------------- UI ---------------- */

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Webhooks</CardTitle>

          <Button size="sm" onClick={() => setAddOpen(true)} className="bg-primary">
            Add Webhook
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading */}
          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading webhooks…
            </p>
          )}

          {/* Empty state */}
          {!loading && webhooks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No webhooks configured yet.
            </p>
          )}

          {/* Webhook list */}
          {webhooks.map((webhook) => (
            <WebhookRow
              key={webhook.webhookId}
              webhook={webhook}
              onEdit={(w) => {
                setSelectedWebhook(w)
                setEditOpen(true)
              }}
              onUpdated={fetchWebhooks}
            />
          ))}
        </CardContent>
      </Card>

      {/* ➕ Add Webhook */}
      <AddWebhookModal
        open={addOpen}
        onOpenChange={setAddOpen}
        ownerType={"CHANNEL_PARTNER"}
        ownerId={user?.partnerId!}
        onCreated={fetchWebhooks}
      />

      {/* ✏️ Edit Webhook */}
      <EditWebhookModal
        open={editOpen}
        onOpenChange={setEditOpen}
        webhook={selectedWebhook}
        onUpdated={fetchWebhooks}
      />
    </>
  )
}

export default WebhooksTab
