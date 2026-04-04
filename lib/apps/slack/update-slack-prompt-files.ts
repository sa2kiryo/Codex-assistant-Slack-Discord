export function getSlackApiPrompt(): string {
  const botToken = process.env.SLACK_BOT_TOKEN

  if (botToken === undefined) {
    return ""
  }

  return `# Slack API

## Available Methods

Slack Web API methods for interacting with Slack.

### Messages
- conversations.history - Get channel message history (channel, limit)
- conversations.replies - Get thread replies (channel, ts, limit)
- chat.postMessage - Send message (channel, text, thread_ts)
- chat.update - Update message (channel, ts, text)
- chat.delete - Delete message (channel, ts)

### Users
- users.info - Get user info (user)
- users.list - List workspace members

### Channels
- conversations.info - Get channel info (channel)
- conversations.list - List channels (types: public_channel, private_channel, im, mpim)
- conversations.open - Open or resume a DM (users)

### Reactions
- reactions.add - Add reaction (channel, timestamp, name)
- reactions.remove - Remove reaction (channel, timestamp, name)

## Message Formatting (mrkdwn)

Slack uses mrkdwn, not standard Markdown:
- *bold* with single asterisks (NOT **)
- _italic_ with underscores
- ~strikethrough~ with tildes
- \`code\` with backticks
- \`\`\`code blocks\`\`\` with triple backticks
- > quotes (single line)
- <@USER_ID> for mentions
- <#CHANNEL_ID> for channel links

## Rate Limits

Slack API has stricter rate limits (~1 req/sec for most methods).
Avoid rapid successive API calls.
`
}
