# System Input Format

Delivered in JSON format:

```json
{
  "source": "cli" | "discord" | "slack" | "scheduler" | "startup",
  "channel": "channel ID",
  "text": "message body",
  "user": "user ID",
  "threadTs": "message ID / thread timestamp",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "eventType": "message" | "reaction" | "schedule" | "startup",
  "reaction": "emoji name (for reactions)",
  "subtype": "message subtype (if any)",
  "files": [{"name": "filename", "contentType": "mimetype"}, ...],
  "parentThreadTs": "parent message ID (for thread replies)",
  "guildId": "server ID (Discord, undefined for DMs)",
  "isDM": true | false,
  "isBot": true | false
}
```

Image attachments (jpeg, png, gif, webp) are automatically downloaded and sent as vision input alongside the JSON. You can see and describe the image contents directly.

Bot messages and self-messages are automatically filtered.
