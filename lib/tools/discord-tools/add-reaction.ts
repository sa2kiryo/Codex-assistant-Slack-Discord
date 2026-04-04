import { z } from "zod"
import { discordApiCall } from "@/core/discord-api"
import { tool } from "@/core/sdk-compat"

export const addReaction = tool(
  "add_reaction",
  `Add a reaction (stamp) to a Discord message.

Common reactions:
- 🥹 (smiling face with tear) - touched, moved
- 😢 or :sob: - sad, crying
- 👍 - agree, good
- ❤️ - love
- 🎉 - celebration
- 👀 - noticed, watching

Use Unicode emoji directly (🥹) or Discord emoji format (:sob:).`,
  {
    channelId: z.string().describe("Channel ID where the message is"),
    messageId: z.string().describe("Message ID to react to"),
    emoji: z.string().describe("Emoji to add (e.g., '🥹', '👍', ':sob:')"),
  },
  async (args) => {
    try {
      const emoji =
        args.emoji.match(/^:(\w+):$/)?.[1] ?? args.emoji

      const encodedEmoji = encodeURIComponent(emoji)
      await discordApiCall(
        "PUT",
        `/channels/${args.channelId}/messages/${args.messageId}/reactions/${encodedEmoji}/@me`,
      )

      return {
        content: [
          {
            type: "text",
            text: `Added reaction ${args.emoji} to message`,
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      }
    }
  },
)
