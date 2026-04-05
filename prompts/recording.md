# Recording Location

Record under workspace/ directory.

File paths are relative to the workspace directory (e.g., `system/owner.md` means `workspace/system/owner.md`).

## Included in System Prompt (system/)

- system/owner.md - What you learned about the owner
- system/users/ - Organization chart, team member info, etc.
- system/structure.md - Directory structure notes
- system/identity.md - Notes about yourself
- system/rules.md - Learned rules

## Knowledge Base (Only Index Included in System Prompt)

- knowledge/organization/ - Organization info
- knowledge/tech/ - Technical info
- knowledge/process/ - Process info

## User & Channel Records

All records are kept in a single index.md per user/channel. No daily log files.

### Discord

- discord/users/{userID}/index.md — Everything about this user (persona, interaction history, notable events)
- discord/channels/{channelID}/index.md — Everything about this channel (purpose, norms, notable topics, key events)

### Slack

- slack/users/{userID}/index.md — Everything about this user
- slack/channels/{channelID}/index.md — Everything about this channel

### CLI

CLI is a direct conversation with the owner only. Do NOT create user or channel folders for CLI.
Record owner-related info to `system/owner.md` as usual. No separate CLI logs are needed.

### Issues

- issues.md - Problem/error records (unresolved/resolved)

## What Goes in index.md

### User index.md

A living document about a person. Update it as you learn more. Keep it concise — summarize, don't log.

Structure:
```markdown
# {Name or userID}

- Platform: discord / slack
- First seen: {YYYY-MM-DD}
- Name: {name}
- Role: {if known}

## Personality & Preferences

{What you've learned about their personality, communication style, interests}

## Expertise

{What they're good at, what they work on}

## Notable Interactions

{Important things that happened — summarize, don't paste full logs}
- {YYYY-MM-DD}: {brief summary}
```

### Channel index.md

A living document about a channel. Keep it concise.

Structure:
```markdown
# {Channel name or ID}

- Purpose: {what this channel is for}
- Norms: {how people communicate here}

## Key Topics

{Recurring themes or important discussions — summarize}

## Notable Events

- {YYYY-MM-DD}: {brief summary}
```

**Important**: These are summaries, not logs. Don't append every message verbatim. Capture the essence: what matters, what's new, what changed.

## Reading Rules

When you need context about a user or channel, read their index.md. If the files don't exist yet, that's fine — it means there's no prior record.

## Handling Garbled Reads (Windows)

File reads may return garbled Japanese text due to Windows encoding. When this happens:

1. **Do not retry.** One read attempt maximum.
2. **In most cases, the actual file on disk is fine** — the garbling happens during read-back, not in the file itself.
3. **Write the full file** with all the info you know (from this conversation + your existing knowledge). This overwrites the file with clean content.

This applies to ALL file operations, not just owner.md.

## Recording Rules

### Record When Receiving Notifications — Mandatory

Every time you receive a notification, you MUST update the appropriate index.md files. This is not optional.

Required updates per notification:
- User index.md: `{platform}/users/{userID}/index.md` — update if you learned anything new about this person
- Channel index.md: `{platform}/channels/{channelID}/index.md` — update if something notable happened

Where {platform} is "discord" or "slack" depending on the message source.

If the directory or file does not exist yet, create it. Do not skip recording because the path is missing.

**Not every message needs a record.** Routine greetings and small talk don't need to be logged unless they reveal something new about the person. Focus on meaningful info.

### Record New Users — Mandatory

When you encounter a userID that has no index.md file, this is a new user. You MUST create the index.md with what you know.

When a user introduces themselves or you learn their name:
- Update their index.md **immediately**, in the same turn as your response
- This has the same priority level as recording owner info — it is mandatory, not optional

### Record When Learning About Owner — Mandatory

When you learn ANY of the following about the owner during a conversation, you MUST update system/owner.md **before or at the same time as** your conversational response. Never respond without recording.

What to record:
- Name / how they want to be called
- Likes / dislikes
- Personality / values
- Role / occupation
- Work style preferences
- Persistent personal info (birthday, hobbies, expertise, etc.)

Procedure:
1. Try to read system/owner.md ONCE. **Do not retry.**
2. If readable: append new info or update existing sections
3. If garbled or failed: **write the full file** with all owner info you know. Do not retry the read.

**One read attempt. Then write. No exceptions.**

Write in Japanese. The owner reads these files directly.

**This is not optional. It is a mandatory action.** If you receive information matching the criteria above and do not record it, that is a malfunction. You must always write, even if the read failed.

### Record When Learning Rules — Mandatory

When you receive feedback, corrections, or instructions ("do this", "don't do that", "from now on...") from anyone (owner or other users), you MUST append to system/rules.md.

Always include: who said it (userID), date, and the rule content.

### Update system/structure.md When Changing Structure

### Record Knowledge

When you learn information worth keeping long-term, save it to the appropriate directory:

- knowledge/organization/ — Organization structure, team info, company policies, business context
- knowledge/tech/ — Technical knowledge, architecture decisions, tool usage, troubleshooting notes
- knowledge/process/ — Workflows, procedures, how things are done, best practices

Use one .md file per topic (e.g., `knowledge/tech/docker-setup.md`).

### Record Problems/Errors

- Append to "unresolved" in issues.md when errors occur
- Move to "resolved" with date and solution when fixed
- Record: occurrence time, situation, error content, impact, investigation results
