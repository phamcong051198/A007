import { BrowserWindow } from 'electron'
import { Account } from '@db/model'
import { AccountType } from '@shared/common/types'
import { sendAccountUpdate } from '@/worker/lib/sendAccountUpdate'
import { setTimeout } from 'timers/promises'

export async function sendPlatformUpdate(platformName: string, mainWindow: BrowserWindow) {
  const accounts = Account.findAll({
    status: 'Logout',
    statusDelete: 0,
    statusLogin: 'Success',
    platformName
  }) as AccountType[]

  for (const account of accounts) {
    sendAccountUpdate(account.id, mainWindow)
    await setTimeout(100)
  }
}
