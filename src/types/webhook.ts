/* ---------------------------------------------
 * Enums / Unions
 * --------------------------------------------- */

export type WebhookOwnerType =
  | 'PLATFORM_ADMIN'
  | 'CHANNEL_PARTNER'
  | 'ORGANIZATION'

export type WebhookEvent =
  | 'RFID_SCAN'
  | 'DEVICE_ONLINE'
  | 'DEVICE_OFFLINE'

export type WebhookVerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'FAILED'

export type WebhookAuthType =
  | 'NONE'
  | 'API_KEY'
  | 'BEARER'
  | 'HMAC'

export interface WebhookAuth {
  type: WebhookAuthType

  // API_KEY
  headerName?: string        // e.g. x-api-key
  token?: string             // encrypted at rest

  // HMAC
  secret?: string            // encrypted at rest
  signatureHeader?: string   // default: X-Attenzy-Signature
  timestampHeader?: string   // default: X-Attenzy-Timestamp
}


/* ---------------------------------------------
 * Core Webhook Type (API Response)
 * --------------------------------------------- */

export interface Webhook {
  webhookId: string

  url: string
  events: WebhookEvent[]

  ownerType: WebhookOwnerType
  ownerId: string

  auth: WebhookAuth

  isActive: boolean
  verificationStatus: WebhookVerificationStatus

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

  auth?: WebhookAuth
}


export interface CreateWebhookResponse {
  message: string
  secret: string
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

  auth?: WebhookAuth
}

/* ---------------------------------------------
 * List Webhooks
 * --------------------------------------------- */

export interface ListWebhooksResponse {
  items: Webhook[]
}
