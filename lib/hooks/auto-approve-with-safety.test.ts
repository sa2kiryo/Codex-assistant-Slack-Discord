import { describe, expect, test } from "bun:test"
import type {
  PreToolUseHookInput,
  PreToolUseHookSpecificOutput,
  SyncHookJSONOutput,
} from "@/core/sdk-compat"
import { autoApproveWithSafety } from "@/hooks/auto-approve-with-safety"

function createPreToolUseInput(
  toolName: string,
  toolInput: Record<string, unknown>,
): PreToolUseHookInput {
  return {
    hook_event_name: "PreToolUse",
    tool_name: toolName,
    tool_input: toolInput,
    tool_use_id: "test-tool-use-id",
    session_id: "test-session-id",
    transcript_path: "/tmp/transcript",
    cwd: "/Users/i/inta-bolt-agent",
  }
}

function createAbortSignal(): AbortSignal {
  return new AbortController().signal
}

function getPermissionDecision(result: SyncHookJSONOutput): string | undefined {
  const output = result.hookSpecificOutput as
    | PreToolUseHookSpecificOutput
    | undefined
  return output?.permissionDecision
}

describe("autoApproveWithSafety", () => {
  describe("PreToolUse 以外のイベントは無視する", () => {
    test("PostToolUse は空オブジェクトを返す", async () => {
      const input = {
        hook_event_name: "PostToolUse",
        tool_name: "Bash",
        tool_input: { command: "ls" },
        tool_response: "output",
        tool_use_id: "test-tool-use-id",
        session_id: "test-session-id",
        transcript_path: "/tmp/transcript",
        cwd: "/Users/i/inta-bolt-agent",
      }
      const result = await autoApproveWithSafety(
        input as never,
        "test-tool-use-id",
        { signal: createAbortSignal() },
      )
      expect(result).toEqual({})
    })
  })

  describe("Bash コマンドのチェック", () => {
    test("安全なコマンドは許可する", async () => {
      const input = createPreToolUseInput("Bash", { command: "ls -la" })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("allow")
    })

    test("危険なコマンドは拒否する", async () => {
      const input = createPreToolUseInput("Bash", { command: "rm -rf /" })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("deny")
    })
  })

  describe("ファイル操作のパスチェック", () => {
    test("許可されたパスへの Read は許可する", async () => {
      const input = createPreToolUseInput("Read", {
        file_path: "/Users/i/inta-bolt-agent/package.json",
      })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("allow")
    })

    test("許可されていないパスへの Read は拒否する", async () => {
      const input = createPreToolUseInput("Read", {
        file_path: "/etc/passwd",
      })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("deny")
    })

    test("危険なファイルパスへの Write は拒否する", async () => {
      const input = createPreToolUseInput("Write", {
        file_path: "/Users/i/inta-bolt-agent/.env",
      })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("deny")
    })

    test("Edit も同様にチェックする", async () => {
      const input = createPreToolUseInput("Edit", {
        file_path: "/etc/passwd",
      })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("deny")
    })
  })

  describe("Glob/Grep のパスチェック", () => {
    test("許可されたパスでの Glob は許可する", async () => {
      const input = createPreToolUseInput("Glob", {
        path: "/Users/i/inta-bolt-agent",
        pattern: "**/*.ts",
      })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("allow")
    })

    test("許可されていないパスでの Grep は拒否する", async () => {
      const input = createPreToolUseInput("Grep", {
        path: "/etc",
        pattern: "password",
      })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("deny")
    })

    test("パスが指定されていない場合は許可する", async () => {
      const input = createPreToolUseInput("Glob", { pattern: "**/*.ts" })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("allow")
    })
  })

  describe("その他のツールは許可する", () => {
    test("WebSearch は許可する", async () => {
      const input = createPreToolUseInput("WebSearch", { query: "test" })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("allow")
    })

    test("Task は許可する", async () => {
      const input = createPreToolUseInput("Task", { prompt: "test" })
      const result = (await autoApproveWithSafety(input, "test-tool-use-id", {
        signal: createAbortSignal(),
      })) as SyncHookJSONOutput
      expect(getPermissionDecision(result)).toBe("allow")
    })
  })
})
