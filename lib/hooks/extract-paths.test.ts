import { describe, expect, test } from "bun:test"
import { extractPaths } from "@/hooks/extract-paths"

describe("extractPaths", () => {
  test("テキストからパスを抽出する", () => {
    const text = "File found at /Users/i/project/file.ts"
    const paths = extractPaths(text)
    expect(paths).toContain("/Users/i/project/file.ts")
  })

  test("複数のパスを抽出する", () => {
    const text =
      "Read /path/to/file1.ts and /path/to/file2.ts and /another/path"
    const paths = extractPaths(text)
    expect(paths.length).toBe(3)
    expect(paths).toContain("/path/to/file1.ts")
    expect(paths).toContain("/path/to/file2.ts")
    expect(paths).toContain("/another/path")
  })

  test("3文字以下のパスは除外する", () => {
    const text = "Path /ab is too short"
    const paths = extractPaths(text)
    expect(paths).not.toContain("/ab")
  })

  test("パスがない場合は空配列を返す", () => {
    const text = "No paths here"
    const paths = extractPaths(text)
    expect(paths).toEqual([])
  })

  test("4文字以上のパスは含める", () => {
    const text = "Path /abcd is included"
    const paths = extractPaths(text)
    expect(paths).toContain("/abcd")
  })
})
