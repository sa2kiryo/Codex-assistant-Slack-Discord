import * as fs from "node:fs"
import * as path from "node:path"

const knowledgeDirs = ["organization", "tech", "process"]

type DirEntry = {
  name: string
  type: "file" | "dir"
  fileCount?: number
}

function scanDir(dirPath: string): DirEntry[] {
  if (!fs.existsSync(dirPath)) {
    return []
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const result: DirEntry[] = []

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue
    }

    if (entry.isDirectory()) {
      const subPath = path.join(dirPath, entry.name)
      const files = fs.readdirSync(subPath).filter((f) => f.endsWith(".md"))
      result.push({
        name: entry.name,
        type: "dir",
        fileCount: files.length,
      })
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      result.push({
        name: entry.name,
        type: "file",
      })
    }
  }

  return result
}

export function generateDataIndex(workspaceDir: string): string {
  const memoryDir = path.join(workspaceDir, "knowledge")

  if (!fs.existsSync(memoryDir)) {
    return ""
  }

  const lines: string[] = ["# Available Data (workspace/knowledge/)", ""]
  lines.push("Read with safe_read as needed.", "")

  let hasContent = false

  for (const dirName of knowledgeDirs) {
    const dirPath = path.join(memoryDir, dirName)

    if (!fs.existsSync(dirPath)) {
      continue
    }

    const entries = scanDir(dirPath)

    if (entries.length === 0) {
      continue
    }

    hasContent = true
    lines.push(`- ${dirName}/`)

    for (const entry of entries) {
      if (entry.type === "dir") {
        const count = entry.fileCount ?? 0
        if (count > 0) {
          lines.push(`  - ${entry.name}/ (${count} files)`)
        }
      }
      if (entry.type === "file") {
        lines.push(`  - ${entry.name}`)
      }
    }
  }

  if (!hasContent) {
    return ""
  }

  lines.push("")

  return lines.join("\n")
}
