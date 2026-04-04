import * as fs from "node:fs/promises"
import * as path from "node:path"
import { tool } from "@/core/sdk-compat"
import { z } from "zod"
import { isPathDenied } from "@/tools/safe-tools/utils"

export const safeEdit = tool(
  "safe_edit",
  "Edit a file by replacing text (sandboxed to allowed paths)",
  {
    file_path: z.string().describe("Path to the file to edit"),
    old_string: z.string().describe("Text to replace"),
    new_string: z.string().describe("Replacement text"),
  },
  async (args) => {
    const resolved = path.resolve(args.file_path)

    if (isPathDenied(resolved)) {
      return { content: [{ type: "text", text: `Access denied: ${resolved}` }] }
    }

    try {
      const content = await fs.readFile(resolved, "utf-8")

      if (!content.includes(args.old_string)) {
        return {
          content: [
            { type: "text", text: "Error: old_string not found in file" },
          ],
        }
      }

      const updated = content.replace(args.old_string, args.new_string)
      await fs.writeFile(resolved, updated, "utf-8")

      return { content: [{ type: "text", text: `Edited: ${resolved}` }] }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { content: [{ type: "text", text: `Error: ${message}` }] }
    }
  },
)
