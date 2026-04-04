import { z } from "zod"
import { slackApiCall } from "@/core/slack-api"
import { tool } from "@/core/sdk-compat"

export const slackSendChannelMessage = tool(
  "slack_send_channel_message",
  `Send a message to a Slack channel. Use this to reply in Slack channels.
Optionally specify threadTs to reply in a thread.`,
  {
    channelId: z.string().describe("Slack channel ID to send message to"),
    message: z.string().describe("Message content to send (supports mrkdwn)"),
    threadTs: z.string().optional().describe("Thread timestamp to reply in thread (optional)"),
  },
  async (args) => {
    try {
      await slackApiCall("chat.postMessage", {
        channel: args.channelId,
        text: args.message,
        thread_ts: args.threadTs,
      })

      return {
        content: [
          {
            type: "text",
            text: `Sent message to Slack channel ${args.channelId}`,
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
