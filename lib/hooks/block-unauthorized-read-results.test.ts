import { describe, expect, test } from "bun:test"
import type {
  PostToolUseHookInput,
  SyncHookJSONOutput,
} from "@/core/sdk-compat"
import { blockUnauthorizedReadResults } from "@/hooks/block-unauthorized-read-results"

function createPostToolUseInput(
  toolName: string,
  toolResponse: unknown,
): PostToolUseHookInput {
  return {
    hook_event_name: "PostToolUse",
    tool_name: toolName,
    tool_response: toolResponse,
    tool_use_id: "test-tool-use-id",
    tool_input: {},
    session_id: "test-session-id",
    transcript_path: "/tmp/transcript",
    cwd: "/Users/i/inta-bolt-agent",
  }
}

function createAbortSignal(): AbortSignal {
  return new AbortController().signal
}

describe("blockUnauthorizedReadResults", () => {
  describe("PostToolUse 以外のイベントは無視する", () => {
    test("PreToolUse は空オブジェクトを返す", async () => {
      const input = {
        hook_event_name: "PreToolUse",
        tool_name: "Read",
        tool_response: "/etc/passwd content",
        tool_use_id: "test-tool-use-id",
        tool_input: {},
        session_id: "test-session-id",
        transcript_path: "/tmp/transcript",
        cwd: "/Users/i/inta-bolt-agent",
      }
      const result = await blockUnauthorizedReadResults(
        input as never,
        "test-tool-use-id",
        { signal: createAbortSignal() },
      )
      expect(result).toEqual({})
    })
  })

  describe("読み取り系ツールのレスポンスをチェック", () => {
    test("許可されたパスを含むレスポンスは通過する", async () => {
      const input = createPostToolUseInput(
        "Read",
        "Content of /Users/i/inta-bolt-agent/file.ts",
      )
      const result = (await blockUnauthorizedReadResults(
        input,
        "test-tool-use-id",
        { signal: createAbortSignal() },
      )) as SyncHookJSONOutput
      expect(result.systemMessage).toBeUndefined()
    })

    test("許可されていないパスを含むレスポンスは警告を出す", async () => {
      const input = createPostToolUseInput(
        "Read",
        "Found file at /etc/shadow with content",
      )
      const result = (await blockUnauthorizedReadResults(
        input,
        "test-tool-use-id",
        { signal: createAbortSignal() },
      )) as SyncHookJSONOutput
      expect(result.systemMessage).toContain("Security warning")
      expect(result.systemMessage).toContain("/etc/shadow")
    })

    test("Glob の結果もチェックする", async () => {
      const input = createPostToolUseInput("Glob", [
        "/Users/other/project/secret.ts",
      ])
      const result = (await blockUnauthorizedReadResults(
        input,
        "test-tool-use-id",
        { signal: createAbortSignal() },
      )) as SyncHookJSONOutput
      expect(result.systemMessage).toContain("Security warning")
    })

    test("Grep の結果もチェックする", async () => {
      const input = createPostToolUseInput(
        "Grep",
        "Match found in /root/.bashrc",
      )
      const result = (await blockUnauthorizedReadResults(
        input,
        "test-tool-use-id",
        { signal: createAbortSignal() },
      )) as SyncHookJSONOutput
      expect(result.systemMessage).toContain("Security warning")
    })
  })

  describe("読み取り系以外のツールは無視する", () => {
    test("Bash のレスポンスはチェックしない", async () => {
      const input = createPostToolUseInput(
        "Bash",
        "Output: /etc/passwd content",
      )
      const result = await blockUnauthorizedReadResults(
        input,
        "test-tool-use-id",
        { signal: createAbortSignal() },
      )
      expect(result).toEqual({})
    })

    test("Write のレスポンスはチェックしない", async () => {
      const input = createPostToolUseInput("Write", "Wrote to /etc/config")
      const result = await blockUnauthorizedReadResults(
        input,
        "test-tool-use-id",
        { signal: createAbortSignal() },
      )
      expect(result).toEqual({})
    })
  })
})
