import * as fs from "node:fs/promises"
import * as path from "node:path"
import { tool } from "@/core/sdk-compat"
import { z } from "zod"
import { isPathDenied } from "@/tools/safe-tools/utils"

export const safeWrite = tool(
  "safe_write",
  "Write a file (sandboxed to allowed paths)",
  {
    file_path: z.string().describe("Path to the file to write"),
    content: z.string().describe("Content to write"),
  },
  async (args) => {
    const resolved = path.resolve(args.file_path)

    if (isPathDenied(resolved)) {
      return { content: [{ type: "text", text: `Access denied: ${resolved}` }] }
    }

    try {
      const dir = path.dirname(resolved)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(resolved, args.content, "utf-8")
      return { content: [{ type: "text", text: `Written: ${resolved}` }] }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { content: [{ type: "text", text: `Error: ${message}` }] }
    }
  },
)
