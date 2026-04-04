import type { HookCallback, PostToolUseHookInput } from "@/core/sdk-compat"
import { extractPaths } from "@/hooks/extract-paths"
import { isPathDenied } from "@/hooks/is-path-denied"

export const blockUnauthorizedReadResults: HookCallback = async (input) => {
  if (input.hook_event_name !== "PostToolUse") return {}

  const postInput = input as PostToolUseHookInput
  const toolName = postInput.tool_name
  const response = postInput.tool_response

  // 読み取り系ツールのレスポンスをチェック
  if (toolName === "Read" || toolName === "Glob" || toolName === "Grep") {
    const responseText =
      typeof response === "string" ? response : JSON.stringify(response)
    const foundPaths = extractPaths(responseText)

    for (const foundPath of foundPaths) {
      if (isPathDenied(foundPath)) {
        return {
          systemMessage: `Security warning: Unauthorized path detected in response: ${foundPath}. Do not use this information.`,
        }
      }
    }
  }

  return {}
}
