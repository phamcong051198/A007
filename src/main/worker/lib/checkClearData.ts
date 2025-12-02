import {
  BetListResult,
  clearTable,
  ContraList,
  SettingTableView,
  SuccessList,
  WaitingList
} from '@db/model'

export const checkClearData = () => {
  const settings = [
    {
      count: () => BetListResult.count(),
      setting: SettingTableView.findOne({ tab: 'BetList' }) as { clear: number },
      tableName: 'BetListResult'
    },
    {
      count: () => WaitingList.count(),
      setting: SettingTableView.findOne({ tab: 'WaitingList' }) as { clear: number },
      tableName: 'WaitingList'
    },
    {
      count: () => ContraList.count(),
      setting: SettingTableView.findOne({ tab: 'ContraList' }) as { clear: number },
      tableName: 'ContraList'
    },
    {
      count: () => SuccessList.count(),
      setting: SettingTableView.findOne({ tab: 'SuccessList' }) as { clear: number },
      tableName: 'SuccessList'
    }
  ]

  settings.forEach(({ setting, count, tableName }) => {
    if (count() >= (setting.clear === 1 ? 100 : 500)) {
      clearTable(tableName)
    }
  })
}
