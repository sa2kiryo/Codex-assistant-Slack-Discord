import { dangerousFilePaths } from "@/hooks/constants"

export function isDangerousFilePath(filePath: string): string | null {
  for (const pattern of dangerousFilePaths) {
    if (pattern.test(filePath)) {
      return `Protected file path: ${filePath}`
    }
  }
  return null
}
