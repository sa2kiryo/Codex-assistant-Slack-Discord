import * as fs from "node:fs/promises"
import * as path from "node:path"
import { tool } from "@/core/sdk-compat"
import { z } from "zod"
import { isPathDenied, resolveWithWorkspaceFallback } from "@/tools/safe-tools/utils"

export const safeRead = tool(
  "safe_read",
  "Read a file (sandboxed to allowed paths)",
  {
    file_path: z.string().describe("Path to the file to read (relative to project root, e.g. 'workspace/system/owner.md')"),
  },
  async (args) => {
    const resolved = resolveWithWorkspaceFallback(args.file_path)

    if (isPathDenied(resolved)) {
      return { content: [{ type: "text", text: `Access denied: ${resolved}` }] }
    }

    try {
      const content = await fs.readFile(resolved, "utf-8")
      return { content: [{ type: "text", text: content }] }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { content: [{ type: "text", text: `Error reading "${args.file_path}" (resolved to "${resolved}"): ${message}` }] }
    }
  },
)
