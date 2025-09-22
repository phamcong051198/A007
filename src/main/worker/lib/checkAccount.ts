import { Account } from '@db/model'
import { STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

export const isAccountActive = (accountId: number) => {
  const account = Account.findOne({
    id: accountId,
    status: STATUS_ACCOUNT.LOGOUT,
    statusLogin: STATUS_LOGIN.SUCCESS,
    statusDelete: 0
  })
  return !!account
}
