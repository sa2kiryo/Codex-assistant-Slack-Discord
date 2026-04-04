import { z } from "zod"
import { Config } from "@/core/config"
import { slackApiCall } from "@/core/slack-api"
import { tool } from "@/core/sdk-compat"

export const slackSendDirectMessage = tool(
  "slack_send_direct_message",
  `Send a direct message to the owner via Slack. This is the primary way to communicate with the owner.
Use this for:
- Reporting important findings (someone needs help, pending reviews)
- Requesting information the AI needs
- Escalations that need user attention
- Status updates and summaries
- Scheduled notifications`,
  {
    message: z.string().describe("Message to send to the owner (supports mrkdwn)"),
  },
  async (args) => {
    const config = new Config()
    if (!config.userSlackId) {
      return {
        content: [
          {
            type: "text",
            text: "Error: SLACK_USER_ID not set in .env",
          },
        ],
        isError: true,
      }
    }

    try {
      const conversation = (await slackApiCall("conversations.open", {
        users: config.userSlackId,
      })) as { channel?: { id?: string } }

      if (!conversation.channel?.id) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Failed to open DM conversation",
            },
          ],
          isError: true,
        }
      }

      await slackApiCall("chat.postMessage", {
        channel: conversation.channel.id,
        text: args.message,
      })

      return {
        content: [
          {
            type: "text",
            text: "Sent DM to owner via Slack",
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
