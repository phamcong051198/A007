import { AccountSwitch } from '@db/model'
import { AccountType } from '@shared/common/types'

export function handleUpdateDataListAccountSwitchAuto(dataAccountInfo: AccountType[]) {
  for (const account of dataAccountInfo) {
    AccountSwitch.update(
      { id: account.id },
      {
        loginID: account.loginID,
        password: account.password,
        proxyIP: account.proxyIP,
        proxyPort: account.proxyPort || '0',
        proxyUsername: account.proxyUsername,
        proxyPassword: account.proxyPassword,
        proxyScope: account.proxyScope
      }
    )
  }
}
