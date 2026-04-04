import { z } from "zod"
import { discordApiCall } from "@/core/discord-api"
import { tool } from "@/core/sdk-compat"

export const callDiscordApi = tool(
  "call_discord_api",
  `Call any Discord REST API endpoint.
Before calling, check the Discord API documentation at https://discord.com/developers/docs/reference

Examples:
- GET /channels/{channelId} - Get channel info
- GET /channels/{channelId}/messages - Get message history (query: { limit: 50 })
- POST /channels/{channelId}/messages - Send message (body: { content: "Hello" })
- GET /users/{userId} - Get user info
- GET /guilds/{guildId} - Get guild info
- GET /guilds/{guildId}/members/{userId} - Get guild member
- PUT /channels/{channelId}/messages/{messageId}/reactions/{emoji}/@me - Add reaction
- DELETE /channels/{channelId}/messages/{messageId} - Delete message

Provide HTTP method, endpoint path, and optional query/body parameters.`,
  {
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).describe("HTTP method"),
    endpoint: z.string().describe("API endpoint path (e.g., '/channels/123456789/messages')"),
    body: z.record(z.string(), z.unknown()).optional().describe("Request body for POST/PUT/PATCH requests"),
    query: z.record(z.string(), z.unknown()).optional().describe("Query parameters for GET requests"),
  },
  async (args) => {
    try {
      const result = await discordApiCall(args.method, args.endpoint, {
        body: args.body,
        query: args.query,
      })

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
