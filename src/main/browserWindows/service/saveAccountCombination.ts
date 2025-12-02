import { Account, AccountPair, clearTable, PlatformPair, SportsBook } from '@db/model'
import { PlatformPairType } from '@db/schema/platformPair'
import { BrowserWindow } from 'electron'

import { AccountPairType, AccountType, SportsBookType } from '@shared/common/types'

import { platformPairStatusManager } from '@/worker/handlePairPlatform/manager'

export async function SaveAccountCombination(
  isClearInvalidAccount: boolean,
  dataAccountPair: AccountPairType[],
  activeSportsBook: string,
  mainWindow: BrowserWindow
) {
  clearTable('DataBet')

  clearTable('AccountPair')
  clearTable('PlatformPair')

  if (isClearInvalidAccount) {
    Account.deleteMany({ statusDelete: 1 })
  }

  if (!dataAccountPair.length) {
    Account.update({}, { statusPair: 0 })
    sendSportsBookData(activeSportsBook, mainWindow)
    platformPairStatusManager(mainWindow)
    return
  }

  const transformedData = dataAccountPair.map((accountPair) => {
    return {
      account1: JSON.stringify(accountPair.account1),
      account2: JSON.stringify(accountPair.account2),
      id: accountPair.id,
      isValid: accountPair.isValid,
      key: accountPair.key
    }
  })

  AccountPair.insertMany(transformedData)
  await updateAccounts(dataAccountPair)
  createPlatformPair(dataAccountPair)
  sendSportsBookData(activeSportsBook, mainWindow)
  platformPairStatusManager(mainWindow)
}

export async function SaveAccountCombinationByArray(
  transformedData: Array<
    | AccountPairType
    | {
        id: string
        isValid: number
        key: string
        account1: AccountType | string
        account2: AccountType | string
      }
  >,
  activeSportsBook: string,
  mainWindow: BrowserWindow
) {
  try {
    clearTable('DataBet')
    clearTable('AccountPair')
    clearTable('PlatformPair')
    if (!Array.isArray(transformedData) || transformedData.length === 0) {
      Account.update({}, { statusPair: 0 })
      sendSportsBookData(activeSportsBook, mainWindow)
      platformPairStatusManager(mainWindow)
      return
    }
    const normalized = transformedData.map((item) => {
      return {
        account1: typeof item.account1 === 'string' ? item.account1 : JSON.stringify(item.account1),
        account2: typeof item.account2 === 'string' ? item.account2 : JSON.stringify(item.account2),
        id: item.id,
        isValid: item.isValid,
        key: item.key
      }
    })

    AccountPair.insertMany(normalized)

    sendSportsBookData(activeSportsBook, mainWindow)
    platformPairStatusManager(mainWindow)
  } catch (error) {
    console.error('SaveAccountCombinationByArray error:', error)
    // gửi lỗi về renderer nếu cần
    try {
      mainWindow.webContents.send('SaveAccountCombinationError', {
        message: error instanceof Error ? error.message : String(error)
      })
    } catch (e) {
      console.error('Failed to send SaveAccountCombinationError:', e)
    }
    // tái ném hoặc xử lý tuỳ nhu cầu
    throw error
  }
}
async function updateAccounts(dataAccountPair: AccountPairType[]) {
  Account.update({}, { statusPair: 0 })

  for (const item of dataAccountPair) {
    const accountIds = [item.account1.id, item.account2.id]

    Promise.all(accountIds.map((accountId) => Account.update({ id: accountId }, { statusPair: 1 })))
  }
}

const createPlatformPair = (dataAccountPair: AccountPairType[]) => {
  const dataPlatformPair = dataAccountPair
    .filter((item) => item.isValid === 1)
    .map((item) => {
      const [platform1, platform2] =
        item.account1.platform < item.account2.platform
          ? [item.account1.platform, item.account2.platform]
          : [item.account2.platform, item.account1.platform]

      const key = `${platform1}_${platform2}`

      return { key, platform1, platform2 }
    })
    .filter(
      (value, index, self) =>
        index ===
        self.findIndex((t) => t.platform1 === value.platform1 && t.platform2 === value.platform2)
    )

  PlatformPair.insertMany(dataPlatformPair)
  return PlatformPair.findAll() as PlatformPairType[]
}

function sendSportsBookData(activeSportsBook: string, mainWindow: BrowserWindow) {
  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]

  const listAccount = Account.findAll({ statusDelete: 0 }) as AccountType[]

  const dataSportsBook = listPlatformBySportsBook.map((sportBook) => {
    const accounts = listAccount.filter((account) => account.platformName === sportBook.platform)
    return { ...sportBook, accounts }
  })
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
