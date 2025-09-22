export function generateTs() {
  const timestamp = Date.now()

  const sequence = Math.floor(1000 + Math.random() * 9000)

  return { timestamp, sequence }
}
