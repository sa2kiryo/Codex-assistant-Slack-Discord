import { z } from "zod"
import { slackApiCall } from "@/core/slack-api"
import { tool } from "@/core/sdk-compat"

export const slackAddReaction = tool(
  "slack_add_reaction",
  `Add a reaction (emoji) to a Slack message.

Common reactions:
- thumbsup - agree, good
- heart - love
- tada - celebration
- eyes - noticed, watching
- white_check_mark - done, confirmed
- sob - sad, crying

Use emoji name without colons (e.g., "thumbsup" not ":thumbsup:").`,
  {
    channelId: z.string().describe("Channel ID where the message is"),
    timestamp: z.string().describe("Message timestamp (ts) to react to"),
    emoji: z.string().describe("Emoji name without colons (e.g., 'thumbsup', 'heart')"),
  },
  async (args) => {
    try {
      const emoji = args.emoji.match(/^:(.+):$/)?.[1] ?? args.emoji

      await slackApiCall("reactions.add", {
        channel: args.channelId,
        timestamp: args.timestamp,
        name: emoji,
      })

      return {
        content: [
          {
            type: "text",
            text: `Added reaction :${emoji}: to message`,
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
