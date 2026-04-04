export function getSlackAllowedTools(): string[] {
  const useSlackApi = process.env.USE_SLACK_API === "true"

  if (!useSlackApi) {
    return []
  }

  return [
    "mcp__agent-tools__slack_call_api",
    "mcp__agent-tools__slack_send_direct_message",
    "mcp__agent-tools__slack_send_channel_message",
    "mcp__agent-tools__slack_add_reaction",
  ]
}
