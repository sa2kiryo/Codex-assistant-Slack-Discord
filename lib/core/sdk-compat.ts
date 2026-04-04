import { z } from "zod"

export type ToolTextContent = {
  type: "text"
  text: string
}

export type ToolResult = {
  content: ToolTextContent[]
  isError?: boolean
}

type ToolReturnValue = ToolResult | string

export type LocalTool<TSchema extends z.ZodTypeAny = z.ZodTypeAny> = {
  name: string
  description: string
  inputSchema: TSchema
  handler: (
    args: z.infer<TSchema>,
    ..._args: unknown[]
  ) => Promise<ToolResult> | ToolResult
}

function normalizeToolResult(result: ToolReturnValue): ToolResult {
  if (typeof result === "string") {
    return {
      content: [{ type: "text", text: result }],
    }
  }

  return result
}

export function tool<const TShape extends z.ZodRawShape>(
  name: string,
  description: string,
  shape: TShape,
  handler: (
    args: z.infer<z.ZodObject<TShape>>,
    ..._args: unknown[]
  ) => Promise<ToolReturnValue> | ToolReturnValue,
): LocalTool<z.ZodObject<TShape>> {
  return {
    name,
    description,
    inputSchema: z.object(shape),
    async handler(args, ...rest) {
      return normalizeToolResult(await handler(args, ...rest))
    },
  }
}

export type HookEventName = "PreToolUse" | "PostToolUse"

export type PreToolUseHookInput = {
  hook_event_name: "PreToolUse"
  tool_name: string
  tool_input: unknown
  tool_use_id?: string
  session_id?: string
  transcript_path?: string
  cwd?: string
}

export type PostToolUseHookInput = {
  hook_event_name: "PostToolUse"
  tool_name: string
  tool_response: unknown
  tool_input?: unknown
  tool_use_id?: string
  session_id?: string
  transcript_path?: string
  cwd?: string
}

export type HookInput = PreToolUseHookInput | PostToolUseHookInput

export type HookOutput = {
  hookSpecificOutput?: {
    hookEventName: HookEventName
    permissionDecision?: "allow" | "deny"
    permissionDecisionReason?: string
    updatedInput?: Record<string, unknown>
  }
  systemMessage?: string
}

export type SyncHookJSONOutput = HookOutput

export type PreToolUseHookSpecificOutput = NonNullable<
  HookOutput["hookSpecificOutput"]
>

export type HookCallback = (
  input: HookInput,
  ..._args: unknown[]
) => Promise<HookOutput> | HookOutput
