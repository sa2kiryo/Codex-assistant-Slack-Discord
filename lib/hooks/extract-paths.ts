import { pathPattern } from "@/hooks/constants"

export function extractPaths(text: string): string[] {
  const matches = text.match(pathPattern)
  if (!matches) return []
  return matches.filter((p) => p.length > 3)
}
