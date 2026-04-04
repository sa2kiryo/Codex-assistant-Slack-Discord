import * as fs from "node:fs"
import * as path from "node:path"
import { getDiscordApiPrompt } from "@/apps/discord/update-discord-prompt-files"
import { getSlackApiPrompt } from "@/apps/slack/update-slack-prompt-files"
import { Config } from "@/core/config"
import { generateDataIndex } from "@/core/generate-data-index"

const workspaceDir =
  process.env.AGENT_DATA_DIR ?? path.join(process.cwd(), "workspace")

const workspaceSystemDir = path.join(workspaceDir, "system")

const promptsDir = path.join(process.cwd(), "prompts")

function readWorkspaceSystemFile(filename: string): string {
  const filepath = path.join(workspaceSystemDir, filename)
  if (!fs.existsSync(filepath)) {
    return ""
  }
  return fs.readFileSync(filepath, "utf-8")
}

function readPromptFile(filename: string): string {
  const filepath = path.join(promptsDir, filename)
  if (!fs.existsSync(filepath)) {
    return ""
  }
  return fs.readFileSync(filepath, "utf-8")
}

function buildBase(): string {
  const config = new Config()
  const ownerId = config.userDiscordId ?? "unknown"
  const botId = config.botDiscordId ?? "unknown"
  const ownerSlackId = config.userSlackId ?? "unknown"
  const botSlackId = config.botSlackId ?? "unknown"

  const base = readPromptFile("base.md")
  const inputFormat = readPromptFile("input-format.md")
  const notification = readPromptFile("notification.md")
  const tools = readPromptFile("tools.md")
  const recording = readPromptFile("recording.md")
  const schedule = readPromptFile("schedule.md")

  const discordSection = buildDiscordSection()
  const slackSection = buildSlackSection()

  const content = [
    base,
    inputFormat,
    notification,
    slackSection,
    discordSection,
    tools,
    recording,
    schedule,
  ]
    .filter((s) => s.length > 0)
    .join("\n\n")

  return content
    .replace(/\{\{ownerId\}\}/g, ownerId)
    .replace(/\{\{botId\}\}/g, botId)
    .replace(/\{\{ownerSlackId\}\}/g, ownerSlackId)
    .replace(/\{\{botSlackId\}\}/g, botSlackId)
}

function buildDiscordSection(): string {
  const parts: string[] = []

  parts.push("## Discord")

  if (process.env.USE_DISCORD_MENTION === "true") {
    const discordMention = readPromptFile("discord-mention.md")
    parts.push(discordMention)
  } else {
    parts.push("現在、返信機能は無効です。")
  }

  if (process.env.USE_DISCORD_API === "true") {
    const discordApi = getDiscordApiPrompt()
    if (discordApi) {
      parts.push(discordApi)
    }
  }

  return parts.join("\n\n")
}

function buildSlackSection(): string {
  if (!process.env.SLACK_BOT_TOKEN) return ""

  const parts: string[] = []

  parts.push("## Slack (Primary Platform)")

  if (process.env.USE_SLACK_MENTION === "true") {
    const slackMention = readPromptFile("slack-mention.md")
    parts.push(slackMention)
  } else {
    parts.push("現在、Slack返信機能は無効です。")
  }

  if (process.env.USE_SLACK_API === "true") {
    const slackApi = getSlackApiPrompt()
    if (slackApi) {
      parts.push(slackApi)
    }
  }

  return parts.join("\n\n")
}

function buildIdentity(): string {
  return readWorkspaceSystemFile("identity.md")
}

function buildUserProfile(): string {
  return readWorkspaceSystemFile("owner.md")
}

function buildNoteStructure(): string {
  const structure = readWorkspaceSystemFile("structure.md")
  if (!structure) return ""
  return `# ディレクトリ構成\n\n${structure}`
}

function buildChannels(): string {
  const channels = readWorkspaceSystemFile("channels.md")
  if (!channels) return ""
  return channels
}

function buildUsers(): string {
  const users = readWorkspaceSystemFile("users.md")
  if (!users) return ""
  return users
}

function buildOrganization(): string {
  const usersDir = path.join(workspaceSystemDir, "users")
  if (!fs.existsSync(usersDir)) return ""

  const files = fs.readdirSync(usersDir).filter((f) => f.endsWith(".md"))
  if (files.length === 0) return ""

  const contents = files.map((f) => {
    const content = fs.readFileSync(path.join(usersDir, f), "utf-8")
    return `## ${f.replace(".md", "")}\n\n${content}`
  })

  return `# 組織情報\n\n${contents.join("\n\n")}`
}

function buildGuidelines(): string {
  const guidelines = readPromptFile("guidelines.md")
  if (!guidelines) return ""
  return guidelines
}

function buildDataIndex(): string {
  return generateDataIndex(workspaceDir)
}

function buildRules(): string {
  const rules = readWorkspaceSystemFile("rules.md")
  if (!rules) return ""
  return rules
}

export function buildSystemPrompt(): string {
  const sections = [
    buildBase(),
    buildGuidelines(),
    buildRules(),
    buildDataIndex(),
    buildIdentity(),
    buildUserProfile(),
    buildChannels(),
    buildUsers(),
    buildOrganization(),
    buildNoteStructure(),
  ]
  return sections.filter((s) => s.length > 0).join("\n\n")
}
