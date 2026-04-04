export type ImageAttachment = {
  name: string
  contentType: string
  base64: string
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
}

export type FileAttachment = {
  name: string
  contentType: string
}

export type Attachment = ImageAttachment | FileAttachment

export type MessageEvent = {
  source: "cli" | "discord" | "slack" | "scheduler" | "startup"
  channel: string
  text: string
  user: string
  threadTs: string
  timestamp: string
  eventType?: "message" | "reaction" | "schedule" | "startup"
  reaction?: string
  subtype?: string
  files?: Array<Attachment>
  parentThreadTs?: string
  guildId?: string
  isDM?: boolean
  isBot?: boolean
}
