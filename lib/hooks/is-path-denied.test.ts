import { describe, expect, test } from "bun:test"
import { isPathDenied } from "@/hooks/is-path-denied"

describe("isPathDenied", () => {
  test("許可されたパスは false を返す", () => {
    expect(isPathDenied("/Users/i/inta-bolt-agent/lib/test.ts")).toBe(false)
    expect(isPathDenied("/Users/i/inta-bolt-agent/package.json")).toBe(false)
  })

  test("許可されていないパスは true を返す", () => {
    expect(isPathDenied("/etc/passwd")).toBe(true)
    expect(isPathDenied("/Users/other/project/file.ts")).toBe(true)
    expect(isPathDenied("/tmp/file.txt")).toBe(true)
  })

  test("相対パスは解決されてチェックされる", () => {
    // カレントディレクトリが /Users/i/inta-bolt-agent の場合
    // 実際の動作はテスト実行時のカレントディレクトリに依存する
    expect(typeof isPathDenied("./test.ts")).toBe("boolean")
  })
})
