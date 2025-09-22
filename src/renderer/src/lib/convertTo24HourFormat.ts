export const convertTo24HourFormat = (time: string) => {
  if (!time) return '00:00'

  const [timePart, period] = time.split(' ')
  const [hourRaw, minute] = timePart.split(':').map(Number)
  let hour = hourRaw
  if (period === 'PM' && hour !== 12) {
    hour += 12
  }
  if (period === 'AM' && hour === 12) {
    hour = 0
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}
