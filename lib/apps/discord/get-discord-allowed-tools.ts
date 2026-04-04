export function getDiscordAllowedTools(): string[] {
  const useDiscordApi = process.env.USE_DISCORD_API === "true"

  if (!useDiscordApi) {
    return []
  }

  return [
    "mcp__agent-tools__call_discord_api",
    "mcp__agent-tools__send_direct_message",
    "mcp__agent-tools__send_channel_message",
    "mcp__agent-tools__add_reaction",
  ]
}
