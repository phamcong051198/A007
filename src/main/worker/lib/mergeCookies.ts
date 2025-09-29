export function mergeCookies(oldCookies: string, setCookieHeader: string | null) {
  const cookieMap = new Map<string, string>()

  if (oldCookies) {
    oldCookies.split(';').forEach((c) => {
      const [k, ...rest] = c.trim().split('=')
      if (!k) return
      cookieMap.set(k, rest.join('='))
    })
  }

  if (setCookieHeader) {
    setCookieHeader.split(/,(?=\s*\w+=)/).forEach((raw) => {
      const [pair] = raw.split(';')
      const [k, ...rest] = pair.trim().split('=')
      cookieMap.set(k, rest.join('='))
    })
  }

  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}
