import type { EventEmitter } from "node:events"
import { Client, Events, GatewayIntentBits, Partials } from "discord.js"
import { Config } from "@/core/config"
import type { Attachment, MessageEvent } from "@/types"
import { downloadDiscordImage } from "@/apps/discord/download-discord-image"

const MAX_BOT_REPLIES = 16
const botReplyCount = new Map<string, number>()

export function createDiscordApp(
  messageEmitter: EventEmitter<{ message: [MessageEvent] }>,
) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
  })

  const config = new Config()
  const botId = config.botDiscordId

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord bot logged in as ${readyClient.user.tag}`)

    // 起動イベントを発火（1.5秒後）
    if (process.env.EMIT_STARTUP_EVENT === "true") {
      setTimeout(() => {
        const startupEvent: MessageEvent = {
          source: "startup",
          channel: "",
          text: "[起動完了] Discord Bot が起動しました。起動時のルールを確認して実行してください。",
          user: "system",
          threadTs: "",
          timestamp: new Date().toISOString(),
          eventType: "startup",
        }
        messageEmitter.emit("message", startupEvent)
        console.log("🚀 起動イベントを送信しました")
      }, 1500)
    }
  })

  client.on(Events.MessageCreate, async (message) => {
    if (botId && message.author.id === botId) return

    const isBot = message.author.bot

    if (isBot) {
      const count = botReplyCount.get(message.channelId) ?? 0
      if (count >= MAX_BOT_REPLIES) {
        console.log(`Bot reply limit reached for channel ${message.channelId}`)
        return
      }
      botReplyCount.set(message.channelId, count + 1)
    } else {
      botReplyCount.set(message.channelId, 0)
    }

    const attachments = [...message.attachments.values()]
    const filePromises = attachments.map(async (attachment): Promise<Attachment> => {
      const contentType = attachment.contentType ?? "unknown"
      const image = await downloadDiscordImage(
        attachment.url,
        attachment.name,
        contentType,
      )
      if (image) {
        return image
      }
      return { name: attachment.name, contentType }
    })
    const files = await Promise.all(filePromises)

    const parentThreadTs =
      message.reference?.messageId !== message.id
        ? message.reference?.messageId
        : undefined

    const event: MessageEvent = {
      source: "discord",
      channel: message.channelId,
      text: message.content,
      user: message.author.id,
      threadTs: message.id,
      timestamp: message.createdAt.toISOString(),
      eventType: "message",
      files: files.length > 0 ? files : undefined,
      parentThreadTs: parentThreadTs,
      guildId: message.guildId ?? undefined,
      isDM: !message.guildId,
      isBot: isBot,
    }

    messageEmitter.emit("message", event)
  })

  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return

    const reactionEvent: MessageEvent = {
      source: "discord",
      channel: reaction.message.channelId,
      text: "",
      user: user.id,
      threadTs: reaction.message.id,
      timestamp: new Date().toISOString(),
      eventType: "reaction",
      reaction: reaction.emoji.name ?? reaction.emoji.id ?? "unknown",
      guildId: reaction.message.guildId ?? undefined,
      isDM: !reaction.message.guildId,
    }

    messageEmitter.emit("message", reactionEvent)
  })

  return client
}
