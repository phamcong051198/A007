import { Account, Setting, SportsBook } from '@db/model'
import { BrowserWindow } from 'electron'

import { AccountType, SettingType, SportsBookType } from '@shared/common/types'

export function handleAddAccountPlatForm(
  mainWindow: BrowserWindow,
  data: { platformName: string; loginURL: string },
  activeSportsBook: string
) {
  const settings = Setting.findAll() as SettingType[]

  const listAccountSamePlatform = Account.findAll({
    platformName: data.platformName,
    statusDelete: 0
  }) as AccountType[]

  const newOrder =
    listAccountSamePlatform.length === 0
      ? 1
      : Math.max(...listAccountSamePlatform.map((acc) => acc.orderNumber ?? 0)) + 1

  Account.create({
    checkBoxAutoLogin: 0,
    checkBoxBet: 1,
    checkBoxLockURL: 0,
    checkBoxRefresh: 1,
    cookie: null,
    credit: '0',
    customIP: null,
    host: null,
    limitMethod: 'TeamName',
    limitType: 'TotalCount',
    livePreGame: 0,
    loginID: null,
    orderNumber: newOrder,
    password: null,
    proxyIP: null,
    proxyPassword: null,
    proxyPort: null,
    proxyScope: 'None',
    proxyUsername: null,
    socketUrl: null,
    status: 'Login',
    statusDelete: 0,
    statusLogin: null,
    statusPair: 0,
    textLog: null,
    totalAmount: '5000',
    totalCount: '2',
    typeCrawl: settings[0].gameType,
    ...data
  })

  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]

  const listAccount = Account.findAll({ statusDelete: 0 }) as AccountType[]

  const dataSportsBook = listPlatformBySportsBook.map((sportBook) => {
    const accounts = listAccount
      .filter((account) => account.platformName === sportBook.platform)
      .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
    return { ...sportBook, accounts }
  })

  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
