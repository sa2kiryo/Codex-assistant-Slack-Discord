import * as path from "node:path"
import { Config } from "@/core/config"

const agentDataDir =
  process.env.AGENT_DATA_DIR ?? path.join(process.cwd(), "workspace")

const config = new Config()

export const allowedBasePaths = [
  agentDataDir,
  process.cwd(),
  ...config.allowedBasePaths,
]

export function isPathDenied(targetPath: string): boolean {
  const resolved = path.resolve(targetPath)
  return !allowedBasePaths.some((base) => resolved.startsWith(base))
}

export function filterAllowedPaths(paths: string[]): string[] {
  return paths.filter((p) => !isPathDenied(p))
}
