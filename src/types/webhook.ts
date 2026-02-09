/* ---------------------------------------------
 * Enums / Unions
 * --------------------------------------------- */

export type WebhookOwnerType = 'PLATFORM_ADMIN' | 'CHANNEL_PARTNER' | 'ORGNIZATION'

export type WebhookEvent =
  | 'RFID_SCAN'
  | 'DEVICE_ONLINE'
  | 'DEVICE_OFFLINE'

/* ---------------------------------------------
 * Core Webhook Type (API Response)
 * --------------------------------------------- */

export interface Webhook {
  webhookId: string
  url: string
  events: string[]

  isActive: boolean
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED"

  lastVerificationError?: string

  createdAt: number
  updatedAt: number
}


/* ---------------------------------------------
 * Create Webhook
 * --------------------------------------------- */

export interface CreateWebhookPayload {
  url: string
  events: WebhookEvent[]

  ownerType: WebhookOwnerType
  ownerId: string

  headers?: Record<string, string>
}

export interface CreateWebhookResponse {
  message: string
  webhook: Webhook
}

/* ---------------------------------------------
 * Update Webhook
 * --------------------------------------------- */

export interface UpdateWebhookPayload {
  webhookId: string

  url?: string
  events?: WebhookEvent[]
  isActive?: boolean
  headers?: Record<string, string>
}

/* ---------------------------------------------
 * List Webhooks
 * --------------------------------------------- */

export interface ListWebhooksResponse {
  items: Webhook[]
}
