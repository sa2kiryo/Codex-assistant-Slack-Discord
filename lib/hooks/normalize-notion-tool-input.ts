import type { HookCallback, PreToolUseHookInput } from "@/core/sdk-compat"

function tryParseJsonObject(value: string): Record<string, unknown> | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null
  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    return null
  }
  return null
}

export const normalizeNotionToolInput: HookCallback = async (input) => {
  if (input.hook_event_name !== "PreToolUse") return {}

  const preInput = input as PreToolUseHookInput
  if (!preInput.tool_name.startsWith("mcp__notion__")) return {}

  const toolInput = preInput.tool_input as Record<string, unknown>
  const parent = toolInput.parent

  if (typeof parent === "string") {
    const parsed = tryParseJsonObject(parent)
    if (parsed) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          updatedInput: { ...toolInput, parent: parsed },
        },
      }
    }
  }

  return {}
}
