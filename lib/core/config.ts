import * as fs from "node:fs"
import * as path from "node:path"

type SecurityConfig = {
  allowedBasePaths: string[]
}

function loadSecurityConfig(): SecurityConfig {
  const configPath = path.join(process.cwd(), "security.json")
  if (!fs.existsSync(configPath)) {
    return { allowedBasePaths: [] }
  }
  const content = fs.readFileSync(configPath, "utf-8")
  const parsed = JSON.parse(content) as Partial<SecurityConfig> | null
  const allowedBasePaths = Array.isArray(parsed?.allowedBasePaths)
    ? parsed.allowedBasePaths
    : []
  return { allowedBasePaths }
}

export class Config {
  private readonly userIdValue: string | null
  private readonly botIdValue: string | null
  private readonly slackUserIdValue: string | null
  private readonly slackBotIdValue: string | null
  private readonly securityConfig: SecurityConfig

  constructor() {
    this.userIdValue = process.env.DISCORD_USER_ID ?? null
    this.botIdValue = process.env.DISCORD_BOT_ID ?? null
    this.slackUserIdValue = process.env.SLACK_USER_ID ?? null
    this.slackBotIdValue = process.env.SLACK_BOT_ID ?? null
    this.securityConfig = loadSecurityConfig()
    Object.freeze(this)
  }

  get exists(): boolean {
    return this.userIdValue !== null || this.slackUserIdValue !== null
  }

  get userDiscordId(): string | null {
    return this.userIdValue
  }

  get botDiscordId(): string | null {
    return this.botIdValue
  }

  get userSlackId(): string | null {
    return this.slackUserIdValue
  }

  get botSlackId(): string | null {
    return this.slackBotIdValue
  }

  get allowedBasePaths(): readonly string[] {
    return this.securityConfig.allowedBasePaths
  }
}
