import { AccountType } from '@shared/common/types'
import { OPTIONS_PROXY } from '@shared/main/constants'

export function isProxyConfigValid(account: AccountType) {
  const { proxyIP, proxyPort, proxyUsername, proxyPassword, proxyScope } = account

  const newIpAddress = proxyIP
  const newPort = proxyPort
  const newUsername = proxyUsername
  const newPassword = proxyPassword

  const ipRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
  const portRegex = /^\d+$/

  const isIpValid = ipRegex.test(newIpAddress)
  const isPortValid = portRegex.test(newPort)

  if (
    proxyScope !== OPTIONS_PROXY.NONE &&
    (!newIpAddress ||
      !newPort ||
      newPort === '0' ||
      !newUsername ||
      !newPassword ||
      !isIpValid ||
      !isPortValid)
  ) {
    return { data: { newIpAddress, newPassword, newPort, newUsername, proxyScope }, status: false }
  }

  return { data: { newIpAddress, newPassword, newPort, newUsername, proxyScope }, status: true }
}
