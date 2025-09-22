import { AccountSwitch } from '@db/model'
import { AccountSwitchType } from '@shared/common/types'

export function handleUpdateDataListAccountSwitch(
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
