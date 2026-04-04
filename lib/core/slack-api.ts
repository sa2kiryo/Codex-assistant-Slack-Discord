const SLACK_API_BASE_URL = "https://slack.com/api"

function getSlackBotToken(): string {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) {
    throw new Error("SLACK_BOT_TOKEN not set in .env")
  }
  return token
}

export async function slackApiCall(
  method: string,
  args: Record<string, unknown> = {},
): Promise<unknown> {
  const token = getSlackBotToken()
  const response = await fetch(`${SLACK_API_BASE_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(args),
  })

  if (!response.ok) {
    throw new Error(`Slack API ${response.status}: ${await response.text()}`)
  }

  const data = (await response.json()) as { ok?: boolean; error?: string }
  if (!data.ok) {
    throw new Error(data.error ?? "Slack API request failed")
  }

  return data
}
