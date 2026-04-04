import { tool } from "@/core/sdk-compat"
import { z } from "zod"
import { ScheduleStorage } from "@/scheduler/schedule-storage"
import { Scheduler } from "@/scheduler/scheduler"
import type { OnceSchedule } from "@/scheduler/types"

export const addOnceSchedule = tool(
  "add_once_schedule",
  `1回きりのリマインドを追加する。

例:
- 明日の10時に会議リマインド
- 2026-01-25T14:00:00+09:00 にタスク締め切り通知`,
  {
    title: z.string().describe("スケジュールのタイトル"),
    message: z.string().describe("通知時に表示するメッセージ"),
    datetime: z
      .string()
      .describe("通知日時 (ISO8601形式、例: 2026-01-24T10:00:00+09:00)"),
  },
  async (args) => {
    const schedule: OnceSchedule = {
      id: crypto.randomUUID(),
      type: "once",
      title: args.title,
      message: args.message,
      datetime: args.datetime,
      notified: false,
      createdAt: new Date().toISOString(),
    }
    const scheduler = new Scheduler(new ScheduleStorage())
    scheduler.add(schedule)
    return `スケジュールを追加しました: ${schedule.title} (ID: ${schedule.id})`
  },
)
