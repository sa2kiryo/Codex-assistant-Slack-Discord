import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { safeWrite } from "@/tools/safe-tools/safe-write"

const testDir = path.join(process.cwd(), "workspace", "__test__")

beforeAll(async () => {
  await fs.mkdir(testDir, { recursive: true })
})

afterAll(async () => {
  await fs.rm(testDir, { recursive: true, force: true })
})

describe("safeWrite", () => {
  test("writes file within allowed path", async () => {
    const filePath = path.join(testDir, "write-test.txt")
    const result = await safeWrite.handler(
      {
        file_path: filePath,
        content: "new content",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Written:")

    const content = await fs.readFile(filePath, "utf-8")
    expect(content).toBe("new content")
  })

  test("creates nested directories", async () => {
    const filePath = path.join(testDir, "nested", "dir", "file.txt")
    const result = await safeWrite.handler(
      {
        file_path: filePath,
        content: "nested content",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Written:")

    const content = await fs.readFile(filePath, "utf-8")
    expect(content).toBe("nested content")
  })

  test("denies writing file outside allowed path", async () => {
    const result = await safeWrite.handler(
      {
        file_path: "/etc/test.txt",
        content: "should not write",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Access denied")
  })
})
