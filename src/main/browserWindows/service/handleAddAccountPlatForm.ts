import { Account, Setting, SportsBook } from '@db/model'
import { AccountType, SettingType, SportsBookType } from '@shared/common/types'
import { BrowserWindow } from 'electron'

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
    loginID: null,
    password: null,
    limitMethod: 'TeamName',
    livePreGame: 0,
    limitType: 'TotalCount',
    totalAmount: '5000',
    totalCount: '2',
    customIP: null,
    proxyIP: null,
    proxyPort: null,
    proxyUsername: null,
    proxyPassword: null,
    proxyScope: 'None',
    typeCrawl: settings[0].gameType,
    checkBoxBet: 1,
    checkBoxRefresh: 1,
    checkBoxAutoLogin: 0,
    checkBoxLockURL: 0,
    credit: '0',
    textLog: null,
    cookie: null,
    host: null,
    socketUrl: null,
    statusLogin: null,
    statusPair: 0,
    status: 'Login',
    statusDelete: 0,
    orderNumber: newOrder,
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
