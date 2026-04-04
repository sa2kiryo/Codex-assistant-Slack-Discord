import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { safeGlob } from "@/tools/safe-tools/safe-glob"

const testDir = path.join(process.cwd(), "workspace", "__test__")

beforeAll(async () => {
  await fs.mkdir(testDir, { recursive: true })
  await fs.writeFile(path.join(testDir, "file1.ts"), "content1", "utf-8")
  await fs.writeFile(path.join(testDir, "file2.ts"), "content2", "utf-8")
  await fs.writeFile(path.join(testDir, "file3.md"), "content3", "utf-8")
})

afterAll(async () => {
  await fs.rm(testDir, { recursive: true, force: true })
})

describe("safeGlob", () => {
  test("finds files matching pattern", async () => {
    const result = await safeGlob.handler(
      {
        pattern: "*.ts",
        cwd: testDir,
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("file1.ts")
    expect(text.text).toContain("file2.ts")
    expect(text.text).not.toContain("file3.md")
  })

  test("returns no files found when pattern matches nothing", async () => {
    const result = await safeGlob.handler(
      {
        pattern: "*.xyz",
        cwd: testDir,
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toBe("No files found")
  })

  test("denies searching outside allowed path", async () => {
    const result = await safeGlob.handler(
      {
        pattern: "*",
        cwd: "/etc",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Access denied")
  })

  test("uses cwd as default when not specified", async () => {
    const result = await safeGlob.handler(
      {
        pattern: "package.json",
        cwd: undefined,
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("package.json")
  })
})
