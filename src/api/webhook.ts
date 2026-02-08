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