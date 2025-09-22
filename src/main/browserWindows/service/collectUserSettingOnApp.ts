import {
  AccountPair,
  AllowLeague,
  BlockLeague,
  Setting,
  SettingLeagueFilter,
  SportsBook
} from '@db/model'
import { AccountPairType } from '@shared/common/types'
import { SettingType, TableLeagueFilterType } from '@shared/common/types'

export function handleCollectUserSettingOnApp() {
  const accountPair = AccountPair.findAll()
  if (!accountPair.length) {
    return {}
  }

  const listAccountPair = accountPair.map((item) => {
    return {
      id: item.id,
      isValid: item.isValid,
      key: item.key,
      account1: item.account1 ? JSON.parse(String(item.account1)) : {},
      account2: item.account2 ? JSON.parse(String(item.account2)) : {}
    }
  }) as AccountPairType[]

  const dataSetting = Setting.findAll() as SettingType[]
  const dataSettingLeagueFilter = SettingLeagueFilter.findAll() as SettingType[]
  const blockLeagues = BlockLeague.findAll() as TableLeagueFilterType[]
  const allowLeagues = AllowLeague.findAll() as TableLeagueFilterType[]

  const platforms = SportsBook.findAll()

  const valueRanges = platforms.map((item) => ({
    platform: item.platform,
    valueRange: item.valueRange ?? 0
  }))

  const bettingSetting = {
    isOther: dataSetting[0].isOther,
    isBetUnderSelected: dataSetting[0].isBetUnderSelected,
    isBetOverSelected: dataSetting[0].isBetOverSelected,
    isBetPutSelected: dataSetting[0].isBetPutSelected,
    isBetEatSelected: dataSetting[0].isBetEatSelected,
    valueRanges: valueRanges
  }
  const settingsBundle = {
    accountPairs: listAccountPair,
    bettingSettings: bettingSetting,
    settings: dataSetting,
    leagueFilters: dataSettingLeagueFilter,
    blockLeagues: blockLeagues,
    allowLeagues: allowLeagues
  }

  return settingsBundle
}
