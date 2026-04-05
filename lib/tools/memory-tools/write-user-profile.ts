import fs from "node:fs/promises"
import path from "node:path"
import { tool } from "@/core/sdk-compat"
import { z } from "zod"
import { safe } from "@/core/utils"

const projectRoot = path.resolve(import.meta.dirname, "..", "..", "..")
const workspaceDir = process.env.AGENT_DATA_DIR ?? path.join(projectRoot, "workspace")
const systemDir = path.join(workspaceDir, "system")

const readFile = safe(fs.readFile)

export const writeUserProfile = tool(
  "write_user_profile",
  "Update user profile with new information",
  {
    info: z.string().describe("Information to add to user profile"),
  },
  async (args) => {
    const filepath = path.join(systemDir, "owner.md")

    const current = await readFile(filepath, "utf-8")

    const base =
      current instanceof Error ? "# User Profile\n\n## Notes\n" : current

    const updated = `${base}\n- ${args.info}`

    await fs.writeFile(filepath, updated, "utf-8")

    return {
      content: [{ type: "text", text: `Added to user profile: ${args.info}` }],
    }
  },
)
