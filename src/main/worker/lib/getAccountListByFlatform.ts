import { Account, AccountSwitch } from '@db/model'
import { AccountSwitchType, AccountType } from '@shared/common/types'

export async function GetListAccountSwitchWorkerByPlatform(
  platFormName: string
): Promise<AccountSwitchType[]> {
  return AccountSwitch.findAll({ platformName: platFormName }) as AccountSwitchType[]
}

export async function GetListAccountByPlatForm(platFormName: string): Promise<AccountType[]> {
  const listAccountByPlatform = Account.findAll({
    platformName: platFormName
  }) as AccountType[]

  return listAccountByPlatform
}

export function UpdateAccountByPlatFormSwitch(dataAccountInfo: AccountType) {
  Account.update(
    {
      id: dataAccountInfo.id
    },
    dataAccountInfo
  )
}

export function UpdateAccountSwitchByPlatFormSwitch(
  dataAccountInfo: AccountSwitchType[],
  platformName: string
) {
  AccountSwitch.deleteMany({ platformName: platformName })

  const updatedDataAccountInfo = dataAccountInfo?.map(({ id, ...account }) => ({
    ...account,
    platformName: platformName
  }))

  AccountSwitch.insertMany(updatedDataAccountInfo)
}
