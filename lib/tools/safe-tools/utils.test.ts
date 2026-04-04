import { describe, expect, test } from "bun:test"
import { filterAllowedPaths, isPathDenied } from "@/tools/safe-tools/utils"

describe("isPathDenied", () => {
  test("allows paths within cwd", () => {
    const result = isPathDenied(`${process.cwd()}/lib/index.ts`)
    expect(result).toBe(false)
  })

  test("allows paths within workspace", () => {
    const result = isPathDenied(`${process.cwd()}/workspace/test.md`)
    expect(result).toBe(false)
  })

  test("denies paths outside allowed base paths", () => {
    const result = isPathDenied("/etc/passwd")
    expect(result).toBe(true)
  })

  test("denies home directory paths", () => {
    const result = isPathDenied("/Users/someone/.ssh/id_rsa")
    expect(result).toBe(true)
  })

  test("denies root paths", () => {
    const result = isPathDenied("/root/.bashrc")
    expect(result).toBe(true)
  })

  test("resolves relative paths", () => {
    const result = isPathDenied("./lib/index.ts")
    expect(result).toBe(false)
  })

  test("denies path traversal attempts", () => {
    const result = isPathDenied(`${process.cwd()}/../../../etc/passwd`)
    expect(result).toBe(true)
  })
})

describe("filterAllowedPaths", () => {
  test("filters out denied paths", () => {
    const paths = [
      `${process.cwd()}/lib/index.ts`,
      "/etc/passwd",
      `${process.cwd()}/workspace/test.md`,
      "/root/.bashrc",
    ]
    const result = filterAllowedPaths(paths)
    expect(result).toEqual([
      `${process.cwd()}/lib/index.ts`,
      `${process.cwd()}/workspace/test.md`,
    ])
  })

  test("returns empty array when all paths are denied", () => {
    const paths = ["/etc/passwd", "/root/.bashrc"]
    const result = filterAllowedPaths(paths)
    expect(result).toEqual([])
  })

  test("returns all paths when all are allowed", () => {
    const paths = [
      `${process.cwd()}/lib/index.ts`,
      `${process.cwd()}/workspace/test.md`,
    ]
    const result = filterAllowedPaths(paths)
    expect(result).toEqual(paths)
  })

  test("handles empty array", () => {
    const result = filterAllowedPaths([])
    expect(result).toEqual([])
  })
})
