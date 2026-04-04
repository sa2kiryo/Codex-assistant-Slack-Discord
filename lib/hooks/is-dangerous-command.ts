import { dangerousPatterns } from "@/hooks/constants"

export function isDangerousCommand(command: string): string | null {
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return `Dangerous command pattern detected: ${pattern}`
    }
  }
  return null
}
