export function isScheduledTime(
  current: { currentDate: string; dayOfWeek: string; currentTime: string },
  task: { isSchedulerEnabled: number; selectedDays: string; timeValue: string; dateValue: string }
): boolean {
  if (!task.isSchedulerEnabled) return false

  const selectedDays: string[] = JSON.parse(task.selectedDays)

  return (
    current.currentTime === task.timeValue &&
    selectedDays.includes(current.dayOfWeek) &&
    current.currentDate <= task.dateValue
  )
}
