import fetch from 'node-fetch'
export async function parseLoginResponse(res: fetch.Response): Promise<{
  status: 'success' | 'expired' | 'fail' | 'blocked' | 'unknown'
  message: string
}> {
  const raw = await res.text()
  let parsed

  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = raw.trim()
  }

  if (typeof parsed === 'object' && parsed !== null && 'code' in parsed) {
    const { code, tokens } = parsed as { code?: number; tokens?: unknown }

    if (code === 1 && tokens) {
      return { message: 'Login success', status: 'success' }
    }

    if (code === 2 && tokens) {
      return {
        message: 'Account password has expired. Please update it on website.',
        status: 'expired'
      }
    }
  }
  if (parsed === 0 || parsed === '0') {
    return { message: 'Invalid loginId or password', status: 'fail' }
  }
  if (typeof parsed === 'string' && parsed.includes('Cloudflare')) {
    return { message: 'Blocked by Cloudflare (Error 1015)', status: 'blocked' }
  }
  return { message: 'Unknown response format', status: 'unknown' }
}
