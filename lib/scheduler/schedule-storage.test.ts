import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import * as fs from "node:fs"
import * as path from "node:path"
import { ScheduleStorage } from "@/scheduler/schedule-storage"
import type { OnceSchedule, RecurringSchedule } from "@/scheduler/types"

const testStorageDir = path.resolve(import.meta.dirname, "../../storage")
const testFilePath = path.join(testStorageDir, "schedules.json")

function createOnceSchedule(id: string): OnceSchedule {
  return {
    id,
    type: "once",
    title: `Test Schedule ${id}`,
    message: "Test message",
    datetime: "2026-01-25T10:00:00+09:00",
    notified: false,
    createdAt: "2026-01-24T10:00:00+09:00",
  }
}

function createRecurringSchedule(id: string): RecurringSchedule {
  return {
    id,
    type: "recurring",
    title: `Recurring Schedule ${id}`,
    message: "Recurring message",
    pattern: { type: "daily", time: "09:00" },
    lastNotifiedDate: null,
    createdAt: "2026-01-24T10:00:00+09:00",
  }
}

describe("ScheduleStorage", () => {
  let storage: ScheduleStorage
  let originalContent: string | null = null

  beforeEach(() => {
    if (fs.existsSync(testFilePath)) {
      originalContent = fs.readFileSync(testFilePath, "utf-8")
    }
    storage = new ScheduleStorage()
  })

  afterEach(() => {
    if (originalContent !== null) {
      fs.writeFileSync(testFilePath, originalContent, "utf-8")
    } else if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
    }
  })

  describe("constructor", () => {
    test("storage ディレクトリが存在しない場合は作成する", () => {
      expect(fs.existsSync(testStorageDir)).toBe(true)
    })

    test("インスタンスは不変である", () => {
      expect(Object.isFrozen(storage)).toBe(true)
    })
  })

  describe("load", () => {
    test("ファイルが存在しない場合は空のスケジュールを返す", () => {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
      const newStorage = new ScheduleStorage()
      const data = newStorage.load()
      expect(data.schedules).toEqual([])
    })

    test("ファイルが存在する場合はスケジュールを読み込む", () => {
      const testData = { schedules: [createOnceSchedule("test-1")] }
      fs.writeFileSync(testFilePath, JSON.stringify(testData), "utf-8")
      const data = storage.load()
      expect(data.schedules.length).toBe(1)
      expect(data.schedules[0].id).toBe("test-1")
    })
  })

  describe("save", () => {
    test("スケジュールデータをファイルに保存する", () => {
      const testData = { schedules: [createOnceSchedule("save-test")] }
      storage.save(testData)
      const content = fs.readFileSync(testFilePath, "utf-8")
      const loaded = JSON.parse(content)
      expect(loaded.schedules[0].id).toBe("save-test")
    })

    test("JSON は整形されて保存される", () => {
      const testData = { schedules: [createOnceSchedule("format-test")] }
      storage.save(testData)
      const content = fs.readFileSync(testFilePath, "utf-8")
      expect(content).toContain("\n")
    })
  })

  describe("add", () => {
    test("新しいスケジュールを追加する", () => {
      storage.save({ schedules: [] })
      storage.add(createOnceSchedule("add-test"))
      const data = storage.load()
      expect(data.schedules.length).toBe(1)
      expect(data.schedules[0].id).toBe("add-test")
    })

    test("既存のスケジュールを保持したまま追加する", () => {
      storage.save({ schedules: [createOnceSchedule("existing")] })
      storage.add(createOnceSchedule("new"))
      const data = storage.load()
      expect(data.schedules.length).toBe(2)
    })

    test("once と recurring の両方を追加できる", () => {
      storage.save({ schedules: [] })
      storage.add(createOnceSchedule("once"))
      storage.add(createRecurringSchedule("recurring"))
      const data = storage.load()
      expect(data.schedules.length).toBe(2)
      expect(data.schedules[0].type).toBe("once")
      expect(data.schedules[1].type).toBe("recurring")
    })
  })

  describe("remove", () => {
    test("指定した ID のスケジュールを削除する", () => {
      storage.save({
        schedules: [createOnceSchedule("keep"), createOnceSchedule("remove")],
      })
      const result = storage.remove("remove")
      expect(result).toBe(true)
      const data = storage.load()
      expect(data.schedules.length).toBe(1)
      expect(data.schedules[0].id).toBe("keep")
    })

    test("存在しない ID の場合は false を返す", () => {
      storage.save({ schedules: [createOnceSchedule("existing")] })
      const result = storage.remove("non-existent")
      expect(result).toBe(false)
    })

    test("削除後も他のスケジュールは保持される", () => {
      storage.save({
        schedules: [
          createOnceSchedule("1"),
          createOnceSchedule("2"),
          createOnceSchedule("3"),
        ],
      })
      storage.remove("2")
      const data = storage.load()
      expect(data.schedules.map((s) => s.id)).toEqual(["1", "3"])
    })
  })

  describe("update", () => {
    test("指定した ID のスケジュールを更新する", () => {
      storage.save({ schedules: [createOnceSchedule("update-test")] })
      const result = storage.update("update-test", { notified: true })
      expect(result).toBe(true)
      const data = storage.load()
      expect((data.schedules[0] as OnceSchedule).notified).toBe(true)
    })

    test("存在しない ID の場合は false を返す", () => {
      storage.save({ schedules: [createOnceSchedule("existing")] })
      const result = storage.update("non-existent", { notified: true })
      expect(result).toBe(false)
    })

    test("更新対象以外のスケジュールは変更されない", () => {
      storage.save({
        schedules: [createOnceSchedule("1"), createOnceSchedule("2")],
      })
      storage.update("1", { title: "Updated Title" })
      const data = storage.load()
      expect(data.schedules[0].title).toBe("Updated Title")
      expect(data.schedules[1].title).toBe("Test Schedule 2")
    })

    test("recurring スケジュールの lastNotifiedDate を更新できる", () => {
      storage.save({ schedules: [createRecurringSchedule("recurring")] })
      storage.update("recurring", { lastNotifiedDate: "2026-01-24" })
      const data = storage.load()
      expect((data.schedules[0] as RecurringSchedule).lastNotifiedDate).toBe(
        "2026-01-24",
      )
    })
  })
})
