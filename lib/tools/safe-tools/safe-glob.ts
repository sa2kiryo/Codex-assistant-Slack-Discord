import * as path from "node:path"
import { tool } from "@/core/sdk-compat"
import { glob } from "glob"
import { z } from "zod"
import { filterAllowedPaths, isPathDenied, resolveWithWorkspaceFallback, allowedBasePaths } from "@/tools/safe-tools/utils"

export const safeGlob = tool(
  "safe_glob",
  "Find files by pattern (sandboxed to allowed paths)",
  {
    pattern: z.string().describe("Glob pattern like **/*.ts"),
    cwd: z.string().optional().describe("Directory to search in (relative to project root, e.g. 'workspace/system'). Defaults to project root."),
  },
  async (args) => {
    const searchDir = args.cwd ?? allowedBasePaths[1]  // project root
    const resolved = args.cwd ? resolveWithWorkspaceFallback(searchDir) : path.resolve(searchDir)

    if (isPathDenied(resolved)) {
      return { content: [{ type: "text", text: `Access denied: ${resolved}` }] }
    }

    const matches = await glob(args.pattern, {
      cwd: resolved,
      absolute: true,
    })

    const filtered = filterAllowedPaths(matches)

    if (filtered.length === 0) {
      return { content: [{ type: "text", text: "No files found" }] }
    }

    return { content: [{ type: "text", text: filtered.join("\n") }] }
  },
)
