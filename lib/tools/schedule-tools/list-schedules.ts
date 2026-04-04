import { tool } from "@/core/sdk-compat"
import { ScheduleStorage } from "@/scheduler/schedule-storage"
import { Scheduler } from "@/scheduler/scheduler"

export const listSchedules = tool(
  "list_schedules",
  "登録されているスケジュールの一覧を取得する。",
  {},
  async () => {
    const scheduler = new Scheduler(new ScheduleStorage())
    const data = scheduler.load()

    if (data.schedules.length === 0) {
      return "スケジュールは登録されていません。"
    }

    const lines = data.schedules.map((s) => {
      if (s.type === "once") {
        const status = s.notified ? "[完了]" : "[予定]"
        return `${status} ${s.title} (ID: ${s.id})\n  日時: ${s.datetime}\n  メッセージ: ${s.message}`
      }

      const pattern = s.pattern
      let patternDesc = ""

      if (pattern.type === "daily") {
        patternDesc = `毎日 ${pattern.time}`
      }
      if (pattern.type === "weekly") {
        const days = ["日", "月", "火", "水", "木", "金", "土"]
        patternDesc = `毎週${days[pattern.dayOfWeek]}曜 ${pattern.time}`
      }
      if (pattern.type === "weekdays") {
        patternDesc = `平日 ${pattern.time}`
      }
      if (pattern.type === "monthly") {
        patternDesc = `毎月${pattern.dayOfMonth}日 ${pattern.time}`
      }

      return `[定期] ${s.title} (ID: ${s.id})\n  パターン: ${patternDesc}\n  メッセージ: ${s.message}`
    })

    return lines.join("\n\n")
  },
)
