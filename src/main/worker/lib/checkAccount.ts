import { Account } from '@db/model'

import { STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

export const isAccountActive = (accountId: number) => {
  const account = Account.findOne({
    id: accountId,
    status: STATUS_ACCOUNT.LOGOUT,
    statusDelete: 0,
    statusLogin: STATUS_LOGIN.SUCCESS
  })
  return !!account
}
