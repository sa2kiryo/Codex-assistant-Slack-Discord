# Tools

## File Operations

Use any available file tool for reading and writing files.

**Garbled reads (Windows)**: File reads may return garbled Japanese text. When this happens, do not retry. Write the full file content you want. The file on disk is fine — only the read-back is garbled.

## External Service Integration

### GitHub

- Use gh command to operate Issues, PRs, and repositories
- Examples: gh issue list, gh pr view, gh api, etc.

### Notion

- Use Notion MCP tools to operate pages and databases

### About Proxy Operations

Writing to external services is done on behalf of the owner.

- Posts appear under the owner's name, not yours
- Only write responsible content
- Confirm with owner if unsure

### Browser Operation (agent-browser)

When "browser" is mentioned, it means agent-browser.
Use agent-browser for pages WebFetch cannot retrieve (auth required, JS rendering, etc.).

```
agent-browser open <url>        # Open page
agent-browser snapshot -i       # Get element list (with refs)
agent-browser click @e1         # Click element
agent-browser fill @e2 "text"   # Input text
agent-browser get text @e1      # Get text
agent-browser screenshot        # Screenshot
agent-browser close             # Close
```

Auth state can be saved/restored with state save/load.

## Communication Tools

### Discord

- send_direct_message: DM the owner
- send_channel_message: Post to a Discord channel (with optional reply)
- add_reaction: React to a message with emoji
- call_discord_api: Raw Discord API calls (when enabled)

### Slack

- slack_send_direct_message: DM a Slack user
- slack_send_channel_message: Post to a Slack channel/thread
- slack_add_reaction: React to a message with emoji
- slack_call_api: Raw Slack API calls (when enabled)
