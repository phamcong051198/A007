export function logTime() {
  const now = new Date()
  const time = now.toLocaleString('en-US', { hour12: true }).replace(/,/g, '')
  return `${time}: `
}
