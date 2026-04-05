import { execFileSync } from "node:child_process"
import * as path from "node:path"
import { tool } from "@/core/sdk-compat"
import { z } from "zod"
import { isPathDenied, resolveWithWorkspaceFallback, allowedBasePaths } from "@/tools/safe-tools/utils"

export const safeGrep = tool(
  "safe_grep",
  "Search for patterns in files (sandboxed to allowed paths)",
  {
    pattern: z.string().describe("Search pattern (regex)"),
    path: z.string().optional().describe("Directory or file to search in (relative to project root, e.g. 'workspace/'). Defaults to project root."),
    glob: z.string().optional().describe("File pattern filter like *.ts"),
  },
  async (args) => {
    const searchPath = args.path ? resolveWithWorkspaceFallback(args.path) : path.resolve(allowedBasePaths[1])

    if (isPathDenied(searchPath)) {
      return {
        content: [{ type: "text", text: `Access denied: ${searchPath}` }],
      }
    }

    const rgArgs = ["--no-heading", "--line-number"]

    if (args.glob) {
      rgArgs.push("--glob", args.glob)
    }

    rgArgs.push(args.pattern, searchPath)

    try {
      const result = execFileSync("rg", rgArgs, {
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 10,
      })

      const lines = result.split("\n")
      const filtered = lines.filter((line) => {
        const match = line.match(/^([^:]+):/)
        if (!match) return false
        return !isPathDenied(match[1])
      })

      if (filtered.length === 0) {
        return { content: [{ type: "text", text: "No matches found" }] }
      }

      return { content: [{ type: "text", text: filtered.join("\n") }] }
    } catch {
      return { content: [{ type: "text", text: "No matches found" }] }
    }
  },
)
