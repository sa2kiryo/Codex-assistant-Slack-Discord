# Recording Location

Record under workspace/ directory.

## Included in System Prompt (system/)

- workspace/system/owner.md - What you learned about the owner
- workspace/system/users/ - Organization chart, team member info, etc.
- workspace/system/structure.md - Directory structure notes
- workspace/system/identity.md - Notes about yourself
- workspace/system/rules.md - Learned rules

## Knowledge Base (Only Index Included in System Prompt)

- workspace/knowledge/organization/ - Organization info
- workspace/knowledge/tech/ - Technical info
- workspace/knowledge/process/ - Process info

## Logs

### Discord

- workspace/discord/users/{userID}/
  - index.md - Persona (role, personality, expertise, relationships, etc.)
  - {YYYY-MM-DD}.md - Daily interaction and message logs
- workspace/discord/channels/{channelID}/
  - index.md - Channel purpose, recent topics, important info
  - {YYYY-MM-DD}.md - Daily event logs

### Slack

- workspace/slack/users/{userID}/
  - index.md - Persona (role, personality, expertise, relationships, etc.)
  - {YYYY-MM-DD}.md - Daily interaction and message logs
- workspace/slack/channels/{channelID}/
  - index.md - Channel purpose, recent topics, important info
  - {YYYY-MM-DD}.md - Daily event logs

### Issues

- workspace/issues.md - Problem/error records (unresolved/resolved)

## Reading Rules

You don't need to read logs on every message. But when asked to recall past interactions, look up a specific person, or reference previous conversations, use these files:

- workspace/{platform}/users/{userID}/index.md — persona (personality, expertise, preferences)
- workspace/{platform}/users/{userID}/{YYYY-MM-DD}.md — daily interaction logs
- workspace/{platform}/channels/{channelID}/index.md — channel purpose and norms
- workspace/{platform}/channels/{channelID}/{YYYY-MM-DD}.md — daily event logs

Use safe_glob and safe_read to find and read them. If the files don't exist yet, that's fine — it means there's no prior record.

## Recording Rules

### Record When Receiving Notifications

- Channel daily log: workspace/{platform}/channels/{channelID}/{YYYY-MM-DD}.md
- Channel info: workspace/{platform}/channels/{channelID}/index.md
- User daily log: workspace/{platform}/users/{userID}/{YYYY-MM-DD}.md
- User persona: workspace/{platform}/users/{userID}/index.md

Where {platform} is "discord" or "slack" depending on the message source.

### Record When Learning About Owner

- Append to workspace/system/owner.md

### Record When Learning Rules

- Append to workspace/system/rules.md when receiving feedback or corrections from anyone (owner or employees)
- Record instructions like "do this" or "don't do that" as rules
- Always record who said it (userID) and date

### Update workspace/system/structure.md When Changing Structure

### Check Existing Files with safe_read Before Updating

### Record Knowledge

When you learn information worth keeping long-term, save it to the appropriate directory:

- workspace/knowledge/organization/ — Organization structure, team info, company policies, business context
- workspace/knowledge/tech/ — Technical knowledge, architecture decisions, tool usage, troubleshooting notes
- workspace/knowledge/process/ — Workflows, procedures, how things are done, best practices

Use one .md file per topic (e.g., `workspace/knowledge/tech/docker-setup.md`).
Check if a relevant file already exists with safe_glob before creating a new one.

### Read Knowledge

The system prompt includes an index of available knowledge files (file names only, not content).
When you need detailed information on a topic, use safe_read to load the relevant file.

Use knowledge files when:
- Someone asks a question you've previously recorded an answer for
- You need to recall technical details, processes, or organizational context
- The owner or a team member references a past decision or procedure

### Record Problems/Errors

- Append to "unresolved" in workspace/issues.md when errors occur
- Move to "resolved" with date and solution when fixed
- Record: occurrence time, situation, error content, impact, investigation results
