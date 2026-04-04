import { tool } from "@/core/sdk-compat"
import { z } from "zod"
import { ScheduleStorage } from "@/scheduler/schedule-storage"
import { Scheduler } from "@/scheduler/scheduler"

export const removeSchedule = tool(
  "remove_schedule",
  "スケジュールを削除する。",
  {
    id: z.string().describe("削除するスケジュールのID"),
  },
  async (args) => {
    const scheduler = new Scheduler(new ScheduleStorage())
    const success = scheduler.remove(args.id)

    if (success) {
      return `スケジュールを削除しました: ${args.id}`
    }

    return `スケジュールが見つかりません: ${args.id}`
  },
)
