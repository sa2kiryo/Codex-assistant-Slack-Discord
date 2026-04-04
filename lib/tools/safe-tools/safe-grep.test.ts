import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { safeGrep } from "@/tools/safe-tools/safe-grep"

const testDir = path.join(process.cwd(), "workspace", "__test__")

beforeAll(async () => {
  await fs.mkdir(testDir, { recursive: true })
  await fs.writeFile(
    path.join(testDir, "search1.ts"),
    "const foo = 1\nconst bar = 2",
    "utf-8",
  )
  await fs.writeFile(
    path.join(testDir, "search2.ts"),
    "const baz = 3\nconst foo = 4",
    "utf-8",
  )
  await fs.writeFile(
    path.join(testDir, "search3.md"),
    "# foo heading\nsome text",
    "utf-8",
  )
})

afterAll(async () => {
  await fs.rm(testDir, { recursive: true, force: true })
})

describe("safeGrep", () => {
  test("finds matches in files", async () => {
    const result = await safeGrep.handler(
      {
        pattern: "foo",
        path: testDir,
        glob: undefined,
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("foo")
    expect(text.text).toContain("search1.ts")
    expect(text.text).toContain("search2.ts")
  })

  test("filters by glob pattern", async () => {
    const result = await safeGrep.handler(
      {
        pattern: "foo",
        path: testDir,
        glob: "*.ts",
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("search1.ts")
    expect(text.text).not.toContain("search3.md")
  })

  test("returns no matches when pattern not found", async () => {
    const result = await safeGrep.handler(
      {
        pattern: "notfound123xyz",
        path: testDir,
        glob: undefined,
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toBe("No matches found")
  })

  test("denies searching outside allowed path", async () => {
    const result = await safeGrep.handler(
      {
        pattern: "root",
        path: "/etc",
        glob: undefined,
      },
      {},
    )
    const text = result.content[0]
    if (text.type !== "text") throw new Error("Expected text content")
    expect(text.text).toContain("Access denied")
  })
})
