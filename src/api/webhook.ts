import axiosServices from '@/utils/axios'
import type {
    Webhook,
    CreateWebhookPayload,
    CreateWebhookResponse
} from '@/types/webhook'

/* -------------------- LIST -------------------- */

export async function listWebhooks(): Promise<{ items: Webhook[] }> {
    const res = await axiosServices.get('/webhooks')
    return res.data
}

/* -------------------- CREATE -------------------- */

export async function createWebhook(
    payload: CreateWebhookPayload
): Promise<CreateWebhookResponse> {
    const res = await axiosServices.post('/webhooks', payload)
    console.log('createWebhook response:', res)
    return res.data
}

/* -------------------- UPDATE -------------------- */

export async function updateWebhook(payload: {
    webhookId: string
    isActive?: boolean
    url?: string
    events?: string[]
}): Promise<{ message: string }> {
    const res = await axiosServices.put('/webhooks', payload)
    return res.data
}

/* -------------------- DELETE -------------------- */

export async function deleteWebhook(
    webhookId: string
): Promise<{ message: string }> {
    const res = await axiosServices.delete('/webhooks', {
        data: { webhookId }
    })
    return res.data
}


export async function verifyWebhook(webhookId: string) {
    const res = await axiosServices.post(
        `/webhooks/${webhookId}/verify`
    )
    return res.data
}


export async function testWebhook(
  webhookId: string,
  payload: {
    orgId: string
    deviceId: string
    eventType: string
  }
) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL}/webhooks/${webhookId}/test`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Test failed")
  }

  return res.json()
}