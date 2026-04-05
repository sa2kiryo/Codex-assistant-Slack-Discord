import * as fs from "node:fs"
import * as path from "node:path"
import { Config } from "@/core/config"

// Derive project root from this file's location (lib/tools/safe-tools/utils.ts)
// This is stable regardless of what process.cwd() returns
const projectRoot = path.resolve(import.meta.dirname, "..", "..", "..")

const agentDataDir =
  process.env.AGENT_DATA_DIR ?? path.join(projectRoot, "workspace")

const config = new Config()

export const allowedBasePaths = [
  agentDataDir,
  projectRoot,
  ...config.allowedBasePaths,
]

export function isPathDenied(targetPath: string): boolean {
  const resolved = path.resolve(targetPath)
  return !allowedBasePaths.some((base) => resolved.startsWith(base))
}

export function filterAllowedPaths(paths: string[]): string[] {
  return paths.filter((p) => !isPathDenied(p))
}

/**
 * Resolve a file path, trying multiple strategies:
 * 1. As-is (absolute or relative to cwd)
 * 2. Relative to project root
 * 3. Relative to workspace dir (agentDataDir)
 */
export function resolveWithWorkspaceFallback(filePath: string): string {
  // Strategy 1: resolve as-is
  const resolved = path.resolve(filePath)
  if (fs.existsSync(resolved)) {
    return resolved
  }

  // Strategy 2: relative to project root
  const fromRoot = path.resolve(projectRoot, filePath)
  if (fs.existsSync(fromRoot)) {
    return fromRoot
  }

  // Strategy 3: relative to workspace dir
  const fromWorkspace = path.resolve(agentDataDir, filePath)
  if (fs.existsSync(fromWorkspace)) {
    return fromWorkspace
  }

  // Return the project-root-relative path as default (most likely intent)
  return fromRoot
}
