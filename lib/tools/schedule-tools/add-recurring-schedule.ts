import { tool } from "@/core/sdk-compat"
import { z } from "zod"
import { ScheduleStorage } from "@/scheduler/schedule-storage"
import { Scheduler } from "@/scheduler/scheduler"
import type { RecurringPattern, RecurringSchedule } from "@/scheduler/types"
import { patternSchema } from "@/tools/schedule-tools/utils"

export const addRecurringSchedule = tool(
  "add_recurring_schedule",
  `定期的なスケジュールを追加する。

pattern の type:
- daily: 毎日 (time のみ指定)
- weekly: 毎週特定曜日 (dayOfWeek: 0=日曜〜6=土曜, time)
- weekdays: 平日のみ (time のみ指定)
- monthly: 毎月特定日 (dayOfMonth: 1-31, time)

例:
- 毎日18時に日報リマインド: { type: "daily", time: "18:00" }
- 毎週月曜9時に週次ミーティング: { type: "weekly", dayOfWeek: 1, time: "09:00" }
- 平日朝9時に出勤確認: { type: "weekdays", time: "09:00" }
- 毎月1日に月次レポート: { type: "monthly", dayOfMonth: 1, time: "10:00" }`,
  {
    title: z.string().describe("スケジュールのタイトル"),
    message: z.string().describe("通知時に表示するメッセージ"),
    pattern: patternSchema.describe("繰り返しパターン"),
  },
  async (args) => {
    const schedule: RecurringSchedule = {
      id: crypto.randomUUID(),
      type: "recurring",
      title: args.title,
      message: args.message,
      pattern: args.pattern as RecurringPattern,
      lastNotifiedDate: null,
      createdAt: new Date().toISOString(),
    }
    const scheduler = new Scheduler(new ScheduleStorage())
    scheduler.add(schedule)
    return `定期スケジュールを追加しました: ${schedule.title} (ID: ${schedule.id})`
  },
)
