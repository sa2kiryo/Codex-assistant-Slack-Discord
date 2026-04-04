import * as fs from "node:fs"
import * as path from "node:path"
import { buildSystemPrompt } from "@/prompts/build-system-prompt"

const output = buildSystemPrompt()
const outputPath = path.join(import.meta.dirname, "system-prompt.md")

fs.writeFileSync(outputPath, output, "utf-8")

const lines = output.split("\n").length
const chars = output.length

console.log(`✅ System prompt written to: ${outputPath}`)
console.log(`📊 ${lines} lines, ${chars} characters`)
