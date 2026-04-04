import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { safeRead } from "@/tools/safe-tools/safe-read"

const testDir = path.join(process.cwd(), "workspace", "__test__")
const testFile = path.join(testDir, "read-test.txt")

beforeAll(async () => {
  await fs.mkdir(testDir, { recursive: true })
  await fs.writeFile(testFile, "test content", "utf-8")
})

afterAll(async () => {
  await fs.rm(testDir, { recursive: true, force: true })
})

describe("safeRead", () => {
  test("reads file within allowed path", async () => {
    const result = await safeRead.handler({ file_path: testFile }, {})
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toBe("test content")
  })

  test("denies reading file outside allowed path", async () => {
    const result = await safeRead.handler({ file_path: "/etc/passwd" }, {})
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Access denied")
  })

  test("returns error for non-existent file", async () => {
    const result = await safeRead.handler(
      {
        file_path: path.join(testDir, "non-existent.txt"),
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Error:")
  })
})
