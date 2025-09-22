import { getRandomInteger } from '@/worker/lib/getRandomInteger'
import { Account, SportsBook } from '@db/model'
import { BrowserWindow } from 'electron'
import { Worker } from 'worker_threads'
import createWorkerDelayLogin from '../../worker/workerDelayLogin?nodeWorker'
import { handleLoginAccount } from '@/browserWindows/service/handleLoginLogoutAccount'
import { AccountType, SportsBookType } from '@shared/common/types'

const workers: Record<string, Worker | null> = {
  P88Bet: null,
  Viva88Bet: null
}

export const handleDelayLogin = (mainWindow: BrowserWindow, platform: string) => {
  const sportsBookByPlatform = SportsBook.findOne({ platform }) as SportsBookType

  if (!sportsBookByPlatform) {
    return
  }

  const { delayLoginSec_from, delayLoginSec_to } = sportsBookByPlatform
  const numberDelay = getRandomInteger(delayLoginSec_from, delayLoginSec_to)

  const accounts = Account.findAll({
    platformName: platform,
    status: 'Login',
    statusDelete: 0
  }) as AccountType[]

  const filterAccount = accounts.filter((account) => {
    return account.loginID && account.password
  })

  if (workers[platform] || !filterAccount.length) return
  handleLoginAccount(filterAccount[0], mainWindow)

  if (filterAccount.length == 1) return

  const worker = createWorkerDelayLogin({ workerData: { platform, numberDelay } })
  workers[platform] = worker

  worker.on('message', (delayLogin) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('DelayLogin', { platform, delayLogin })
    }
  })

  worker.on('exit', () => {
    workers[platform] = null

    const accounts = Account.findAll({
      platformName: platform,
      status: 'Login'
    }) as AccountType[]

    const filterAccount = accounts.filter((account) => account.loginID && account.password)

    if (!filterAccount.length) return
    handleDelayLogin(mainWindow, platform)
  })

  worker.on('error', (error) => {
    console.error(`Worker error for platform: ${platform}`, error)
    workers[platform] = null
  })
}
