import { z } from "zod"
import { discordApiCall } from "@/core/discord-api"
import { tool } from "@/core/sdk-compat"

export const sendChannelMessage = tool(
  "send_channel_message",
  "Send a message to a Discord channel. Use this to reply in channels.",
  {
    channelId: z.string().describe("Discord channel ID to send message to"),
    message: z.string().describe("Message content to send"),
    replyTo: z.string().optional().describe("Message ID to reply to (optional)"),
  },
  async (args) => {
    try {
      await discordApiCall("POST", `/channels/${args.channelId}/messages`, {
        body: {
          content: args.message,
          ...(args.replyTo
            ? { message_reference: { message_id: args.replyTo } }
            : {}),
        },
      })

      return {
        content: [
          {
            type: "text",
            text: `Sent message to channel ${args.channelId}`,
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
