import { addReaction } from "@/tools/discord-tools/add-reaction"
import { callDiscordApi } from "@/tools/discord-tools/call-discord-api"
import { sendChannelMessage } from "@/tools/discord-tools/send-channel-message"
import { sendDirectMessage } from "@/tools/discord-tools/send-direct-message"

export function createDiscordTools() {
  const useDiscordApi = process.env.USE_DISCORD_API === "true"

  if (!useDiscordApi) {
    return []
  }

  return [
    callDiscordApi,
    sendDirectMessage,
    sendChannelMessage,
    addReaction,
  ]
}
