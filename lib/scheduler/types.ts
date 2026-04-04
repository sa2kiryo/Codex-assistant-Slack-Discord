export type DailyPattern = {
  type: "daily"
  time: string
}

export type WeeklyPattern = {
  type: "weekly"
  dayOfWeek: number
  time: string
}

export type WeekdaysPattern = {
  type: "weekdays"
  time: string
}

export type MonthlyPattern = {
  type: "monthly"
  dayOfMonth: number
  time: string
}

export type RecurringPattern =
  | DailyPattern
  | WeeklyPattern
  | WeekdaysPattern
  | MonthlyPattern

export type OnceSchedule = {
  id: string
  type: "once"
  title: string
  message: string
  datetime: string
  notified: boolean
  createdAt: string
}

export type RecurringSchedule = {
  id: string
  type: "recurring"
  title: string
  message: string
  pattern: RecurringPattern
  lastNotifiedDate: string | null
  createdAt: string
}

export type Schedule = OnceSchedule | RecurringSchedule

export type ScheduleData = {
  schedules: Schedule[]
}
