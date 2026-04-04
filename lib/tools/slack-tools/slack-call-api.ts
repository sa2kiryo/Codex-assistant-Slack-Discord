import { z } from "zod"
import { slackApiCall } from "@/core/slack-api"
import { tool } from "@/core/sdk-compat"

export const slackCallApi = tool(
  "slack_call_api",
  `Call any Slack Web API method.
Before calling, check the Slack API documentation at https://api.slack.com/methods

Examples:
- conversations.history - Get channel message history (channel, limit)
- conversations.replies - Get thread replies (channel, ts)
- conversations.info - Get channel info (channel)
- users.info - Get user info (user)
- users.list - List workspace members
- chat.postMessage - Send message (channel, text)
- chat.update - Update message (channel, ts, text)
- chat.delete - Delete message (channel, ts)
- reactions.add - Add reaction (channel, timestamp, name)

Note: Slack API has stricter rate limits than Discord (~1 req/sec for most methods).`,
  {
    method: z.string().describe("Slack Web API method (e.g., 'conversations.history')"),
    args: z.record(z.string(), z.unknown()).optional().describe("Arguments for the API method"),
  },
  async (toolArgs) => {
    try {
      const result = await slackApiCall(toolArgs.method, toolArgs.args ?? {})

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: "text",
            text: `Error: ${message}`,
          },
        ],
        isError: true,
      }
    }
  },
)
