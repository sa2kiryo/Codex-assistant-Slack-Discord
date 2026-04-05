import fs from "node:fs/promises"
import path from "node:path"
import { tool } from "@/core/sdk-compat"
import { safe } from "@/core/utils"

const projectRoot = path.resolve(import.meta.dirname, "..", "..", "..")
const workspaceDir = process.env.AGENT_DATA_DIR ?? path.join(projectRoot, "workspace")
const systemDir = path.join(workspaceDir, "system")

const readFile = safe(fs.readFile)

export const readUserProfile = tool(
  "read_user_profile",
  "Read the user profile",
  {},
  async () => {
    const filepath = path.join(systemDir, "owner.md")

    const content = await readFile(filepath, "utf-8")

    if (content instanceof Error) {
      return {
        content: [{ type: "text", text: "User profile not found" }],
      }
    }

    return {
      content: [{ type: "text", text: String(content) }],
    }
  },
)
