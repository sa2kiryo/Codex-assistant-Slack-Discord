import type { EventEmitter } from "node:events"
import { formatCurrentTime } from "@/core/utils"
import { ScheduleStorage } from "@/scheduler/schedule-storage"
import { Scheduler } from "@/scheduler/scheduler"
import type { MessageEvent } from "@/types"

export { ScheduleStorage } from "@/scheduler/schedule-storage"
export { Scheduler, type ScheduleStoragePort } from "@/scheduler/scheduler"

export function startScheduler(
  messageEmitter: EventEmitter<{ message: [MessageEvent] }>,
): void {
  console.log("📅 スケジューラを起動しました")

  const scheduler = new Scheduler(new ScheduleStorage())
  const checkInterval = 60 * 1000

  setInterval(() => {
    const now = new Date()
    const data = scheduler.load()

    for (const schedule of data.schedules) {
      if (!scheduler.shouldNotify(schedule, now)) {
        continue
      }

      const event: MessageEvent = {
        source: "scheduler",
        channel: "",
        text: `[スケジュール通知] ${schedule.title}: ${schedule.message}`,
        user: "system",
        threadTs: "",
        timestamp: formatCurrentTime(),
        eventType: "schedule",
      }

      messageEmitter.emit("message", event)
      scheduler.markNotified(schedule, now)

      console.log(`📅 通知: ${schedule.title}`)
    }
  }, checkInterval)
}
