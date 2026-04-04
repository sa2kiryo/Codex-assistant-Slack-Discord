import { z } from "zod"
import { Config } from "@/core/config"
import { discordApiCall } from "@/core/discord-api"
import { tool } from "@/core/sdk-compat"

export const sendDirectMessage = tool(
  "send_direct_message",
  `Send a direct message to the owner. Use this for:
- Reporting important findings (someone needs help, pending reviews)
- Requesting information the AI needs
- Escalations that need user attention
- Status updates and summaries`,
  {
    message: z.string().describe("Message to send to the owner"),
  },
  async (args) => {
    const config = new Config()
    if (!config.exists || !config.userDiscordId) {
      return {
        content: [
          {
            type: "text",
            text: "Error: DISCORD_USER_ID not set in .env",
          },
        ],
        isError: true,
      }
    }

    try {
      const dmChannel = (await discordApiCall("POST", "/users/@me/channels", {
        body: { recipient_id: config.userDiscordId },
      })) as { id?: string }

      if (!dmChannel.id) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Failed to open DM channel",
            },
          ],
          isError: true,
        }
      }

      await discordApiCall("POST", `/channels/${dmChannel.id}/messages`, {
        body: { content: args.message },
      })

      return {
        content: [
          {
            type: "text",
            text: "Sent DM to owner",
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
