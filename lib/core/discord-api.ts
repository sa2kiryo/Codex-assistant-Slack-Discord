const DISCORD_API_BASE_URL = "https://discord.com/api/v10"

function getDiscordBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN not set in .env")
  }
  return token
}

type DiscordMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export async function discordApiCall(
  method: DiscordMethod,
  endpoint: string,
  options: {
    body?: unknown
    query?: Record<string, unknown>
  } = {},
): Promise<unknown> {
  const token = getDiscordBotToken()
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const url = new URL(`${DISCORD_API_BASE_URL}${normalizedEndpoint}`)

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (response.status === 204) {
    return { ok: true }
  }

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Discord API ${response.status}: ${text}`)
  }

  if (!text) {
    return { ok: true }
  }

  return JSON.parse(text) as unknown
}
