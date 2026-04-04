import { describe, expect, test } from "bun:test"
import type { ScheduleStoragePort } from "@/scheduler/scheduler"
import { Scheduler } from "@/scheduler/scheduler"
import type {
  OnceSchedule,
  RecurringSchedule,
  Schedule,
  ScheduleData,
} from "@/scheduler/types"

function createMockStorage(
  initialData: ScheduleData = { schedules: [] },
): ScheduleStoragePort {
  let data = initialData
  return {
    load: () => data,
    save: (newData) => {
      data = newData
    },
    add: (schedule) => {
      data = { schedules: [...data.schedules, schedule] }
    },
    remove: (id) => {
      const index = data.schedules.findIndex((s) => s.id === id)
      if (index === -1) return false
      data = { schedules: data.schedules.filter((s) => s.id !== id) }
      return true
    },
    update: (id, updates) => {
      const index = data.schedules.findIndex((s) => s.id === id)
      if (index === -1) return false
      data = {
        schedules: data.schedules.map((s) =>
          s.id === id ? ({ ...s, ...updates } as Schedule) : s,
        ),
      }
      return true
    },
  }
}

function createOnceSchedule(datetime: string, notified = false): OnceSchedule {
  return {
    id: "test-once",
    type: "once",
    title: "Test Once",
    message: "Test message",
    datetime,
    notified,
    createdAt: "2026-01-01T00:00:00+09:00",
  }
}

function createRecurringSchedule(
  pattern: RecurringSchedule["pattern"],
  lastNotifiedDate: string | null = null,
): RecurringSchedule {
  return {
    id: "test-recurring",
    type: "recurring",
    title: "Test Recurring",
    message: "Test message",
    pattern,
    lastNotifiedDate,
    createdAt: "2026-01-01T00:00:00+09:00",
  }
}

describe("Scheduler", () => {
  describe("constructor", () => {
    test("インスタンスは不変である", () => {
      const scheduler = new Scheduler(createMockStorage())
      expect(Object.isFrozen(scheduler)).toBe(true)
    })
  })

  describe("load", () => {
    test("storage からデータを読み込む", () => {
      const schedule = createOnceSchedule("2026-01-24T10:00:00+09:00")
      const scheduler = new Scheduler(
        createMockStorage({ schedules: [schedule] }),
      )
      const data = scheduler.load()
      expect(data.schedules.length).toBe(1)
    })
  })

  describe("add", () => {
    test("スケジュールを追加する", () => {
      const scheduler = new Scheduler(createMockStorage())
      scheduler.add(createOnceSchedule("2026-01-24T10:00:00+09:00"))
      expect(scheduler.load().schedules.length).toBe(1)
    })
  })

  describe("remove", () => {
    test("スケジュールを削除する", () => {
      const schedule = createOnceSchedule("2026-01-24T10:00:00+09:00")
      const scheduler = new Scheduler(
        createMockStorage({ schedules: [schedule] }),
      )
      const result = scheduler.remove("test-once")
      expect(result).toBe(true)
      expect(scheduler.load().schedules.length).toBe(0)
    })
  })

  describe("shouldNotify - once スケジュール", () => {
    test("指定日時を過ぎていれば true を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createOnceSchedule("2026-01-24T10:00:00+09:00")
      const now = new Date("2026-01-24T10:01:00+09:00")
      expect(scheduler.shouldNotify(schedule, now)).toBe(true)
    })

    test("指定日時前であれば false を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createOnceSchedule("2026-01-24T10:00:00+09:00")
      const now = new Date("2026-01-24T09:59:00+09:00")
      expect(scheduler.shouldNotify(schedule, now)).toBe(false)
    })

    test("既に通知済みであれば false を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createOnceSchedule("2026-01-24T10:00:00+09:00", true)
      const now = new Date("2026-01-24T10:01:00+09:00")
      expect(scheduler.shouldNotify(schedule, now)).toBe(false)
    })
  })

  describe("shouldNotify - daily スケジュール", () => {
    test("指定時刻を過ぎていれば true を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule({ type: "daily", time: "09:00" })
      const now = new Date(2026, 0, 24, 9, 1)
      expect(scheduler.shouldNotify(schedule, now)).toBe(true)
    })

    test("指定時刻前であれば false を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule({ type: "daily", time: "09:00" })
      const now = new Date(2026, 0, 24, 8, 59)
      expect(scheduler.shouldNotify(schedule, now)).toBe(false)
    })

    test("同じ日に既に通知済みであれば false を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule(
        { type: "daily", time: "09:00" },
        "2026-01-24",
      )
      const now = new Date(2026, 0, 24, 10, 0)
      expect(scheduler.shouldNotify(schedule, now)).toBe(false)
    })
  })

  describe("shouldNotify - weekly スケジュール", () => {
    test("指定曜日かつ指定時刻を過ぎていれば true を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      // 2026-01-23 は金曜日 (dayOfWeek = 5)
      const schedule = createRecurringSchedule({
        type: "weekly",
        dayOfWeek: 5,
        time: "09:00",
      })
      const now = new Date(2026, 0, 23, 9, 1)
      expect(scheduler.shouldNotify(schedule, now)).toBe(true)
    })

    test("指定曜日でなければ false を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule({
        type: "weekly",
        dayOfWeek: 1,
        time: "09:00",
      })
      const now = new Date(2026, 0, 23, 9, 1)
      expect(scheduler.shouldNotify(schedule, now)).toBe(false)
    })
  })

  describe("shouldNotify - weekdays スケジュール", () => {
    test("平日かつ指定時刻を過ぎていれば true を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule({
        type: "weekdays",
        time: "09:00",
      })
      // 2026-01-23 は金曜日
      const now = new Date(2026, 0, 23, 9, 1)
      expect(scheduler.shouldNotify(schedule, now)).toBe(true)
    })

    test("週末であれば false を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule({
        type: "weekdays",
        time: "09:00",
      })
      // 2026-01-24 は土曜日
      const now = new Date(2026, 0, 24, 9, 1)
      expect(scheduler.shouldNotify(schedule, now)).toBe(false)
    })
  })

  describe("shouldNotify - monthly スケジュール", () => {
    test("指定日かつ指定時刻を過ぎていれば true を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule({
        type: "monthly",
        dayOfMonth: 24,
        time: "09:00",
      })
      const now = new Date(2026, 0, 24, 9, 1)
      expect(scheduler.shouldNotify(schedule, now)).toBe(true)
    })

    test("指定日でなければ false を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule({
        type: "monthly",
        dayOfMonth: 1,
        time: "09:00",
      })
      const now = new Date(2026, 0, 24, 9, 1)
      expect(scheduler.shouldNotify(schedule, now)).toBe(false)
    })
  })

  describe("getNotificationUpdates", () => {
    test("once スケジュールは notified: true を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createOnceSchedule("2026-01-24T10:00:00+09:00")
      const now = new Date(2026, 0, 24, 10, 1)
      const updates = scheduler.getNotificationUpdates(schedule, now)
      expect(updates).toEqual({ notified: true })
    })

    test("recurring スケジュールは lastNotifiedDate を返す", () => {
      const scheduler = new Scheduler(createMockStorage())
      const schedule = createRecurringSchedule({ type: "daily", time: "09:00" })
      const now = new Date(2026, 0, 24, 9, 1)
      const updates = scheduler.getNotificationUpdates(schedule, now)
      expect(updates).toEqual({ lastNotifiedDate: "2026-01-24" })
    })
  })

  describe("markNotified", () => {
    test("once スケジュールを通知済みにする", () => {
      const schedule = createOnceSchedule("2026-01-24T10:00:00+09:00")
      const scheduler = new Scheduler(
        createMockStorage({ schedules: [schedule] }),
      )
      const now = new Date(2026, 0, 24, 10, 1)
      scheduler.markNotified(schedule, now)
      const updated = scheduler.load().schedules[0] as OnceSchedule
      expect(updated.notified).toBe(true)
    })

    test("recurring スケジュールの lastNotifiedDate を更新する", () => {
      const schedule = createRecurringSchedule({ type: "daily", time: "09:00" })
      const scheduler = new Scheduler(
        createMockStorage({ schedules: [schedule] }),
      )
      const now = new Date(2026, 0, 24, 9, 1)
      scheduler.markNotified(schedule, now)
      const updated = scheduler.load().schedules[0] as RecurringSchedule
      expect(updated.lastNotifiedDate).toBe("2026-01-24")
    })
  })
})
