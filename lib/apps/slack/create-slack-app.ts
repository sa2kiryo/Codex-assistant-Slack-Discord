import type { EventEmitter } from "node:events"
import { App } from "@slack/bolt"
import { Config } from "@/core/config"
import type { Attachment, MessageEvent } from "@/types"
import { downloadSlackFile } from "@/apps/slack/download-slack-file"

const MAX_BOT_REPLIES = 16
const botReplyCount = new Map<string, number>()

export function createSlackApp(
  messageEmitter: EventEmitter<{ message: [MessageEvent] }>,
): App {
  const botToken = process.env.SLACK_BOT_TOKEN
  const appToken = process.env.SLACK_APP_TOKEN

  const app = new App({
    token: botToken,
    appToken: appToken,
    socketMode: true,
  })

  const config = new Config()
  const botId = config.botSlackId

  app.event("message", async ({ event }) => {
    const messageEvent = event as typeof event & {
      user?: string
      bot_id?: string
      text?: string
      ts: string
      thread_ts?: string
      channel: string
      channel_type?: string
      team?: string
      files?: Array<{
        url_private_download?: string
        name: string
        mimetype: string
      }>
      subtype?: string
    }

    if (messageEvent.subtype === "message_changed" || messageEvent.subtype === "message_deleted") {
      return
    }

    if (botId && messageEvent.user === botId) return
    if (messageEvent.bot_id && botId && messageEvent.bot_id === botId) return

    const isBot = messageEvent.bot_id !== undefined

    if (isBot) {
      const count = botReplyCount.get(messageEvent.channel) ?? 0
      if (count >= MAX_BOT_REPLIES) {
        console.log(`Slack bot reply limit reached for channel ${messageEvent.channel}`)
        return
      }
      botReplyCount.set(messageEvent.channel, count + 1)
    } else {
      botReplyCount.set(messageEvent.channel, 0)
    }

    const files: Array<Attachment> = []
    if (messageEvent.files && botToken) {
      for (const file of messageEvent.files) {
        if (file.url_private_download) {
          const image = await downloadSlackFile(
            file.url_private_download,
            file.name,
            file.mimetype,
            botToken,
          )
          if (image) {
            files.push(image)
          } else {
            files.push({ name: file.name, contentType: file.mimetype })
          }
        } else {
          files.push({ name: file.name, contentType: file.mimetype })
        }
      }
    }

    const timestamp = new Date(Number.parseFloat(messageEvent.ts) * 1000).toISOString()

    const converted: MessageEvent = {
      source: "slack",
      channel: messageEvent.channel,
      text: messageEvent.text ?? "",
      user: messageEvent.user ?? messageEvent.bot_id ?? "unknown",
      threadTs: messageEvent.ts,
      timestamp,
      eventType: "message",
      files: files.length > 0 ? files : undefined,
      parentThreadTs: messageEvent.thread_ts !== messageEvent.ts
        ? messageEvent.thread_ts
        : undefined,
      guildId: messageEvent.team ?? undefined,
      isDM: messageEvent.channel_type === "im",
      isBot,
    }

    messageEmitter.emit("message", converted)
  })

  app.event("reaction_added", async ({ event }) => {
    if (botId && event.user === botId) return

    const timestamp = new Date(
      Number.parseFloat(event.event_ts) * 1000,
    ).toISOString()

    const reactionEvent: MessageEvent = {
      source: "slack",
      channel: event.item.type === "message" ? event.item.channel : "",
      text: "",
      user: event.user,
      threadTs: event.item.type === "message" ? event.item.ts : "",
      timestamp,
      eventType: "reaction",
      reaction: event.reaction,
      isDM: false,
    }

    messageEmitter.emit("message", reactionEvent)
  })

  return app
}
