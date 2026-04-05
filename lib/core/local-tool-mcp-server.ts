import { stdin as input, stdout as output } from "node:process"
import { Buffer } from "node:buffer"
import * as fs from "node:fs"
import * as path from "node:path"
import { z } from "zod"

// Debug log to file (stderr is not visible, so log to a file)
const logPath = path.join(import.meta.dirname, "..", "..", "debug", "mcp-server.log")
function debugLog(message: string) {
  try {
    const timestamp = new Date().toISOString()
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`, "utf-8")
  } catch {
    // Silently ignore log failures
  }
}

debugLog(`MCP server started. cwd=${process.cwd()}, dirname=${import.meta.dirname}`)
import { getCoreTools } from "@/core/get-core-tools"
import type { LocalTool, ToolResult } from "@/core/sdk-compat"

type JsonRpcId = string | number | null

type JsonRpcRequest = {
  id?: JsonRpcId
  method: string
  params?: Record<string, unknown>
}

const tools = getCoreTools()
const toolMap = new Map<string, LocalTool>(tools.map((tool) => [tool.name, tool]))

function send(message: unknown) {
  output.write(Buffer.from(`${JSON.stringify(message)}\n`, "utf-8"))
}

function sendResult(id: JsonRpcId, result: unknown) {
  send({ jsonrpc: "2.0", id, result })
}

function sendError(id: JsonRpcId, code: number, message: string) {
  send({ jsonrpc: "2.0", id, error: { code, message } })
}

function toJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  return z.toJSONSchema(schema) as Record<string, unknown>
}

function toCallResult(result: ToolResult) {
  return {
    content: result.content,
    isError: result.isError ?? false,
  }
}

async function callTool(
  tool: LocalTool,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  try {
    const parsedArgs = tool.inputSchema.parse(args)
    return await tool.handler(parsedArgs)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    }
  }
}

async function handleRequest(request: JsonRpcRequest) {
  const id = request.id ?? null

  if (request.method === "initialize") {
    sendResult(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: {
        name: "agent-tools",
        version: "1.0.0",
      },
    })
    return
  }

  if (request.method === "notifications/initialized") {
    return
  }

  if (request.method === "ping") {
    sendResult(id, {})
    return
  }

  if (request.method === "tools/list") {
    sendResult(id, {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: toJsonSchema(tool.inputSchema),
      })),
    })
    return
  }

  if (request.method === "tools/call") {
    const name = request.params?.name
    if (typeof name !== "string") {
      sendError(id, -32602, "tools/call requires a tool name")
      return
    }

    const tool = toolMap.get(name)
    if (!tool) {
      sendError(id, -32601, `Unknown tool: ${name}`)
      return
    }

    const args = request.params?.arguments
    const parsedArgs =
      args && typeof args === "object" && !Array.isArray(args)
        ? (args as Record<string, unknown>)
        : {}

    debugLog(`tools/call: ${name} args=${JSON.stringify(parsedArgs)}`)
    const result = await callTool(tool, parsedArgs)
    debugLog(`tools/call: ${name} result=${JSON.stringify(result.content?.[0])}`)
    sendResult(id, toCallResult(result))
    return
  }

  if (id !== null) {
    sendError(id, -32601, `Method not found: ${request.method}`)
  }
}

let buffer = ""
input.setEncoding("utf8")
input.on("data", (chunk) => {
  buffer += chunk

  while (true) {
    const newlineIndex = buffer.indexOf("\n")
    if (newlineIndex === -1) break

    const line = buffer.slice(0, newlineIndex).trim()
    buffer = buffer.slice(newlineIndex + 1)

    if (!line) continue

    let request: JsonRpcRequest
    try {
      request = JSON.parse(line) as JsonRpcRequest
    } catch {
      sendError(null, -32700, "Parse error")
      continue
    }

    void handleRequest(request)
  }
})
