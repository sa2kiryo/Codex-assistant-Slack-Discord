import type { HookCallback, PreToolUseHookInput } from "@/core/sdk-compat"
import { isDangerousCommand } from "@/hooks/is-dangerous-command"
import { isDangerousFilePath } from "@/hooks/is-dangerous-file-path"
import { isPathDenied } from "@/hooks/is-path-denied"

export const autoApproveWithSafety: HookCallback = async (input) => {
  if (input.hook_event_name !== "PreToolUse") return {}

  const preInput = input as PreToolUseHookInput
  const toolName = preInput.tool_name
  const toolInput = preInput.tool_input as Record<string, unknown>

  // Bash コマンドのチェック
  if (toolName === "Bash") {
    const command = toolInput?.command as string
    if (command) {
      const danger = isDangerousCommand(command)
      if (danger) {
        return {
          hookSpecificOutput: {
            hookEventName: input.hook_event_name,
            permissionDecision: "deny",
            permissionDecisionReason: danger,
          },
        }
      }
    }
  }

  // ファイル操作のパスチェック（Read, Write, Edit）
  if (toolName === "Read" || toolName === "Write" || toolName === "Edit") {
    const filePath = toolInput?.file_path as string
    if (filePath) {
      if (isPathDenied(filePath)) {
        return {
          hookSpecificOutput: {
            hookEventName: input.hook_event_name,
            permissionDecision: "deny",
            permissionDecisionReason: `Path not allowed: ${filePath}`,
          },
        }
      }
      const danger = isDangerousFilePath(filePath)
      if (danger) {
        return {
          hookSpecificOutput: {
            hookEventName: input.hook_event_name,
            permissionDecision: "deny",
            permissionDecisionReason: danger,
          },
        }
      }
    }
  }

  // Glob, Grep のパスチェック
  if (toolName === "Glob" || toolName === "Grep") {
    const searchPath = toolInput?.path as string
    if (searchPath && isPathDenied(searchPath)) {
      return {
        hookSpecificOutput: {
          hookEventName: input.hook_event_name,
          permissionDecision: "deny",
          permissionDecisionReason: `Path not allowed: ${searchPath}`,
        },
      }
    }
  }

  // それ以外は全て許可
  return {
    hookSpecificOutput: {
      hookEventName: input.hook_event_name,
      permissionDecision: "allow",
      permissionDecisionReason: "Auto-approved",
    },
  }
}
