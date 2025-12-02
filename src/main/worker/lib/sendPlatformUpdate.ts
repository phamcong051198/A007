import { setTimeout } from 'timers/promises'

import { Account } from '@db/model'
import { BrowserWindow } from 'electron'

import { AccountType } from '@shared/common/types'

import { sendAccountUpdate } from '@/worker/lib/sendAccountUpdate'

export async function sendPlatformUpdate(platformName: string, mainWindow: BrowserWindow) {
  const accounts = Account.findAll({
    platformName,
    status: 'Logout',
    statusDelete: 0,
    statusLogin: 'Success'
  }) as AccountType[]

  for (const account of accounts) {
    sendAccountUpdate(account.id, mainWindow)
    await setTimeout(100)
  }
}
