import * as path from "node:path"
import { allowedBasePaths } from "@/hooks/constants"

export function isPathDenied(targetPath: string): boolean {
  const resolved = path.resolve(targetPath)
  return !allowedBasePaths.some((base) => resolved.startsWith(base))
}
