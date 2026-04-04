import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { safeEdit } from "@/tools/safe-tools/safe-edit"

const testDir = path.join(process.cwd(), "workspace", "__test__")
const testFile = path.join(testDir, "edit-test.txt")

beforeAll(async () => {
  await fs.mkdir(testDir, { recursive: true })
})

afterAll(async () => {
  await fs.rm(testDir, { recursive: true, force: true })
})

describe("safeEdit", () => {
  test("edits file within allowed path", async () => {
    await fs.writeFile(testFile, "hello world", "utf-8")

    const result = await safeEdit.handler(
      {
        file_path: testFile,
        old_string: "world",
        new_string: "universe",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Edited:")

    const content = await fs.readFile(testFile, "utf-8")
    expect(content).toBe("hello universe")
  })

  test("returns error when old_string not found", async () => {
    await fs.writeFile(testFile, "hello world", "utf-8")

    const result = await safeEdit.handler(
      {
        file_path: testFile,
        old_string: "notfound",
        new_string: "replacement",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("old_string not found")
  })

  test("denies editing file outside allowed path", async () => {
    const result = await safeEdit.handler(
      {
        file_path: "/etc/passwd",
        old_string: "root",
        new_string: "hacked",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Access denied")
  })

  test("returns error for non-existent file", async () => {
    const result = await safeEdit.handler(
      {
        file_path: path.join(testDir, "non-existent.txt"),
        old_string: "test",
        new_string: "replaced",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Error:")
  })
})
