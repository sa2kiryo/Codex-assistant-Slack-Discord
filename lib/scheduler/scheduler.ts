import type {
  OnceSchedule,
  RecurringSchedule,
  Schedule,
  ScheduleData,
} from "@/scheduler/types"

export type ScheduleStoragePort = {
  load(): ScheduleData
  save(data: ScheduleData): void
  add(schedule: Schedule): void
  remove(id: string): boolean
  update(id: string, updates: Partial<Schedule>): boolean
}

export class Scheduler {
  private readonly storage: ScheduleStoragePort

  constructor(storage: ScheduleStoragePort) {
    this.storage = storage
    Object.freeze(this)
  }

  load(): ScheduleData {
    return this.storage.load()
  }

  add(schedule: Schedule): void {
    this.storage.add(schedule)
  }

  remove(id: string): boolean {
    return this.storage.remove(id)
  }

  shouldNotify(schedule: Schedule, now: Date): boolean {
    if (schedule.type === "once") {
      return this.checkOnceSchedule(schedule, now)
    }
    return this.checkRecurringSchedule(schedule, now)
  }

  getNotificationUpdates(schedule: Schedule, now: Date): Partial<Schedule> {
    if (schedule.type === "once") {
      return { notified: true }
    }
    return { lastNotifiedDate: this.formatDate(now) }
  }

  markNotified(schedule: Schedule, now: Date): void {
    const updates = this.getNotificationUpdates(schedule, now)
    this.storage.update(schedule.id, updates)
  }

  private checkOnceSchedule(schedule: OnceSchedule, now: Date): boolean {
    if (schedule.notified) {
      return false
    }
    const targetDate = new Date(schedule.datetime)
    return now >= targetDate
  }

  private checkRecurringSchedule(
    schedule: RecurringSchedule,
    now: Date,
  ): boolean {
    const todayStr = this.formatDate(now)

    if (schedule.lastNotifiedDate === todayStr) {
      return false
    }

    const pattern = schedule.pattern
    const targetTime = this.parseTime(pattern.time)
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    if (currentHour < targetTime.hour) {
      return false
    }
    if (currentHour === targetTime.hour && currentMinute < targetTime.minute) {
      return false
    }

    if (pattern.type === "daily") {
      return true
    }

    if (pattern.type === "weekdays") {
      const dayOfWeek = now.getDay()
      return dayOfWeek >= 1 && dayOfWeek <= 5
    }

    if (pattern.type === "weekly") {
      return now.getDay() === pattern.dayOfWeek
    }

    if (pattern.type === "monthly") {
      return now.getDate() === pattern.dayOfMonth
    }

    return false
  }

  private parseTime(timeStr: string): { hour: number; minute: number } {
    const parts = timeStr.split(":")
    return {
      hour: Number.parseInt(parts[0], 10),
      minute: Number.parseInt(parts[1], 10),
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
}
