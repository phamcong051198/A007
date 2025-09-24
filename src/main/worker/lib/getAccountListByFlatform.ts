import { Account } from '@db/model'
import { AccountType } from '@shared/common/types'

export async function GetListAccountByPlatForm(platFormName: string): Promise<AccountType[]> {
  const listAccountByPlatform = Account.findAll({
    platformName: platFormName
  }) as AccountType[]

  return listAccountByPlatform
}
