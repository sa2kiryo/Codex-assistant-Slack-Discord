import { EventEmitter } from "node:events"
import * as fs from "node:fs"
import * as fsp from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { Codex, type ThreadEvent } from "@openai/codex-sdk"
import { createDiscordApp } from "@/apps/discord/create-discord-app"
import { createSlackApp } from "@/apps/slack/create-slack-app"
import { createCli } from "@/cli/readline"
import { buildCodexInput } from "@/core/prompt-generator"
import { patchNotionOpenApiIfNeeded } from "@/core/patch-notion-openapi"
import { buildSystemPrompt } from "@/prompts/build-system-prompt"
import { startScheduler as runScheduler } from "@/scheduler"
import type { MessageEvent } from "@/types"

const workspaceDir = process.env.AGENT_DATA_DIR ?? `${process.cwd()}/workspace`
const messageEmitter = new EventEmitter<{ message: [MessageEvent] }>()

const discordClient = createDiscordApp(messageEmitter)

const slackBotToken = process.env.SLACK_BOT_TOKEN
const slackAppToken = process.env.SLACK_APP_TOKEN
const slackApp =
  slackBotToken && slackAppToken ? createSlackApp(messageEmitter) : null

const cli = createCli(messageEmitter)
const systemPrompt = buildSystemPrompt()

function hasCodexAuth(): boolean {
  if (process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY) {
    return true
  }

  const authPath = path.join(os.homedir(), ".codex", "auth.json")
  return fs.existsSync(authPath)
}

function buildCodexConfig() {
  const notionToken = process.env.NOTION_TOKEN ?? process.env.NOTION_API_KEY
  return {
    mcp_servers: {
      "agent-tools": {
        command: "bun",
        args: ["run", "lib/core/local-tool-mcp-server.ts"],
      },
      ...(notionToken
        ? {
            notion: {
              command: "bunx",
              args: ["@notionhq/notion-mcp-server"],
              env: { NOTION_TOKEN: notionToken },
            },
          }
        : {}),
      gdrive: {
        command: "npx",
        args: ["-y", "@isaacphi/mcp-gdrive"],
        env: { GDRIVE_CREDS_DIR: "." },
      },
    },
  }
}

async function writeAgentsFile() {
  const agentsPath = path.join(workspaceDir, "AGENTS.md")
  await fsp.mkdir(workspaceDir, { recursive: true })
  await fsp.writeFile(agentsPath, systemPrompt, "utf-8")
}

function logThreadEvent(event: ThreadEvent) {
  if (event.type === "item.completed") {
    if (event.item.type === "agent_message") {
      cli.log(event.item.text)
      return
    }

    if (event.item.type === "mcp_tool_call") {
      cli.log(`Tool: ${event.item.tool}`)
      return
    }
  }

  if (event.type === "turn.failed") {
    cli.log(`Error: ${event.error.message}`)
  }
}

const codex = new Codex({
  config: buildCodexConfig(),
})

const thread = codex.startThread({
  model: process.env.CODEX_MODEL ?? "gpt-5.4",
  approvalPolicy: "never",
  sandboxMode: "workspace-write",
  workingDirectory: workspaceDir,
  skipGitRepoCheck: true,
  additionalDirectories: [process.cwd()],
})

const queue: MessageEvent[] = []
let processing = false

async function drainQueue() {
  if (processing) return
  processing = true

  while (queue.length > 0) {
    const event = queue.shift()
    if (!event) continue

    try {
      const input = await buildCodexInput(event)
      const { events } = await thread.runStreamed(input)

      for await (const threadEvent of events) {
        logThreadEvent(threadEvent)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      cli.log(`Agent error: ${message}`)
    } finally {
      cli.rl.prompt()
    }
  }

  processing = false
}

messageEmitter.on("message", (event) => {
  queue.push(event)
  void drainQueue()
})

patchNotionOpenApiIfNeeded()

if (!hasCodexAuth()) {
  console.error(
    "Codex authentication not found. Run `codex login` to sign in with ChatGPT, or set OPENAI_API_KEY.",
  )
  process.exit(1)
}

await writeAgentsFile()
console.log(systemPrompt.length > 0 ? "System prompt loaded" : "System prompt is empty")

const discordToken = process.env.DISCORD_BOT_TOKEN
if (discordToken) {
  await discordClient.login(discordToken)
} else {
  console.log("DISCORD_BOT_TOKEN not set, Discord disabled")
}

if (slackApp) {
  await slackApp.start()
  console.log("Slack bot started in Socket Mode")
} else {
  console.log("SLACK_BOT_TOKEN or SLACK_APP_TOKEN not set, Slack disabled")
}

runScheduler(messageEmitter)
cli.rl.prompt()
