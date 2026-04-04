export function getDiscordApiPrompt(): string {
  const botToken = process.env.DISCORD_BOT_TOKEN

  if (botToken === undefined) {
    return ""
  }

  return `# Discord API

## Available Methods

Discord.js client methods for interacting with Discord API.

### Messages
- GET /channels/{channelId} - Get channel info
- GET /channels/{channelId}/messages - Get message history
- POST /channels/{channelId}/messages - Send message (body: { content: "Hello" })

### Users
- GET /users/{userId} - Get user info

### Guilds (Servers)
- GET /guilds/{guildId} - Get guild info
- GET /guilds/{guildId}/members/{userId} - Get guild member

### Reactions
- PUT /channels/{channelId}/messages/{messageId}/reactions/{emoji}/@me - Add reaction

## Message Formatting

Discord uses a subset of Markdown:
- **bold** with \\*\\*text\\*\\*
- *italic* with \\*text\\*
- \`code\` with backticks
- \`\`\`code blocks\`\`\` with triple backticks
- > quotes with >
- ||spoilers|| with ||text||

## Mentions

- User: <@USER_ID>
- Channel: <#CHANNEL_ID>
- Role: <@&ROLE_ID>
`
}

export async function updateDiscordPromptFiles(): Promise<null> {
  return null
}
