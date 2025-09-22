import { Worker } from 'worker_threads'
import { BrowserWindow } from 'electron'

import createWorkerCrawlP88 from './platform/P88/workerCrawl?nodeWorker'
import createWorkerLoginP88 from './platform/P88/workerLogin?nodeWorker'
import createWorkerSwitchAccountP88 from './platform/P88/workerSwitchAccount?nodeWorker'

import createWorkerLoginSbobet from './platform/Sbobet/workerLogin?nodeWorker'
import createWorkerCrawlSbobet from './platform/Sbobet/workerCrawl?nodeWorker'
import createWorkerSwitchAccountSbobet from './platform/Sbobet/workerSwitchAccount?nodeWorker'

import createWorkerCrawlViva88 from './platform/Viva88/workerCrawl?nodeWorker'
import createWorkerHandleDataViva88 from './platform/Viva88/workerHandleData?nodeWorker'
import createWorkerLoginViva88 from './platform/Viva88/workerLogin?nodeWorker'
import createWorkerSwitchAccountViva from './platform/Viva88/workerSwitchAccount?nodeWorker'

import createWorkerLoginWbet from './platform/Wbet/workerLogin?nodeWorker'
import createWorkerCrawlWbet from './platform/Wbet/workerCrawl?nodeWorker'
import createWorkerSwitchAccountWBet from './platform/Wbet/workerSwitchAccount?nodeWorker'

import createWorkerLogin3IN1Bet from './platform/3In1bet/workerLogin?nodeWorker'
import createWorkerCrawl3IN1Bet from './platform/3In1bet/workerCrawl?nodeWorker'
import createWorkerSwitchAccount3IN1Bet from './platform/3In1bet/workerSwitchAccount?nodeWorker'

import createWorkerAutoLogin from './workerAutoLogin?nodeWorker'
import createWorkerPlaceBet from './workerPlaceBet?nodeWorker'

import { handleLogoutAccount } from '@/browserWindows/service/handleLoginLogoutAccount'
import handleBetList from '@/worker/lib/handleBetList'
import handleContraList from '@/worker/lib/handleContraList'
import handleSuccessList from '@/worker/lib/handleSuccessList'
import { sendAccountUpdate } from '@/worker/lib/sendAccountUpdate'
import { sendCount } from '@/worker/lib/sendCount'
import { Account, ContraList, SuccessList, WaitingList } from '@db/model'
import {
  UpdateAccountByPlatFormSwitch,
  UpdateAccountSwitchByPlatFormSwitch
} from './lib/getAccountListByFlatform'
import createWorkerScheduledLogin from './workerScheduledLogin?nodeWorker'
import createWorkerScheduledLogout from './workerScheduledLogout?nodeWorker'
import { sendPlatformUpdate } from '@/worker/lib/sendPlatformUpdate'
import { QueueHandler } from '@shared/main/types'
import { PLATFORM } from '@shared/main/constants'
import { AccountType, SportsBook } from '@shared/common/types'

let workerCrawlP88: Worker | null = null
let workerCrawlWbet: Worker | null = null
let workerCrawlSbobet: Worker | null = null
let workerCrawl3in1bet: Worker | null = null

let workerHandleDataViva88: Worker | null = null

let workerPlaceBet: Worker | null = null
let workerAutoLogin: Worker | null = null

let workerSwitchAccountP88: Worker | null = null
let workerSwitchAccountViva: Worker | null = null
let workerSwitchAccountSbobet: Worker | null = null
let workerSwitchAccountWbet: Worker | null = null
let workerSwitchAccount3IN1bet: Worker | null = null

const platformHandlers: Record<string, QueueHandler> = {
  P88Bet: {
    queue: [],
    isProcessing: false,
    createWorkerLogin: createWorkerLoginP88,
    createWorkerCrawl: createWorkerCrawlP88,

    processor(mainWindow: BrowserWindow) {
      const handler = platformHandlers[PLATFORM.P88BET]
      if (handler.isProcessing || handler.queue.length === 0) return

      const account = handler.queue.shift()
      if (!account) return

      const accountInfo = Account.findOne({
        id: account.id,
        platformName: PLATFORM.P88BET,
        statusDelete: 0
      }) as AccountType
      if (!accountInfo) return

      handler.isProcessing = true
      startWorker(accountInfo, mainWindow)
    }
  },
  Viva88Bet: {
    queue: [],
    isProcessing: false,
    createWorkerLogin: createWorkerLoginViva88,
    createWorkerCrawl: createWorkerCrawlViva88,

    processor(mainWindow: BrowserWindow) {
      const handler = platformHandlers[PLATFORM.VIVA88BET]
      if (handler.isProcessing || handler.queue.length === 0) return

      const account = handler.queue.shift()
      if (!account) return

      const accountInfo = Account.findOne({
        id: account.id,
        platformName: PLATFORM.VIVA88BET,
        statusDelete: 0
      }) as AccountType
      if (!accountInfo) return

      handler.isProcessing = true
      startWorker(accountInfo, mainWindow)
    }
  },
  Sbobet: {
    queue: [],
    isProcessing: false,
    createWorkerLogin: createWorkerLoginSbobet,
    createWorkerCrawl: createWorkerCrawlSbobet,

    processor(mainWindow: BrowserWindow) {
      const handler = platformHandlers[PLATFORM.SBOBET]
      if (handler.isProcessing || handler.queue.length === 0) return

      const account = handler.queue.shift()
      if (!account) return

      const accountInfo = Account.findOne({
        id: account.id,
        platformName: PLATFORM.SBOBET,
        statusDelete: 0
      }) as AccountType
      if (!accountInfo) return

      handler.isProcessing = true
      startWorker(accountInfo, mainWindow)
    }
  },
  WBet: {
    queue: [],
    isProcessing: false,
    createWorkerLogin: createWorkerLoginWbet,
    createWorkerCrawl: createWorkerCrawlWbet,

    processor(mainWindow: BrowserWindow) {
      const handler = platformHandlers[PLATFORM.WBET]
      if (handler.isProcessing || handler.queue.length === 0) return

      const account = handler.queue.shift()
      if (!account) return

      const accountInfo = Account.findOne({
        id: account.id,
        platformName: PLATFORM.WBET,
        statusDelete: 0
      }) as AccountType
      if (!accountInfo) return

      handler.isProcessing = true
      startWorker(accountInfo, mainWindow)
    }
  },
  '3in1Bet': {
    queue: [],
    isProcessing: false,
    createWorkerLogin: createWorkerLogin3IN1Bet,
    createWorkerCrawl: createWorkerCrawl3IN1Bet,

    processor(mainWindow: BrowserWindow) {
      const handler = platformHandlers[PLATFORM['3IN1BET']]
      if (handler.isProcessing || handler.queue.length === 0) return

      const account = handler.queue.shift()
      if (!account) return

      const accountInfo = Account.findOne({
        id: account.id,
        platformName: PLATFORM['3IN1BET'],
        statusDelete: 0
      }) as AccountType
      if (!accountInfo) return

      handler.isProcessing = true
      startWorker(accountInfo, mainWindow)
    }
  }
}

export function enqueueWorker(account: AccountType, mainWindow: BrowserWindow) {
  const handler = platformHandlers[account.platformName]
  if (!handler) return

  handler.queue.push(account)
  !handler.isProcessing && handler.processor(mainWindow)
}

async function startWorker(account: AccountType, mainWindow: BrowserWindow) {
  const handler = platformHandlers[account.platformName]

  if (handler) {
    const worker = handler.createWorkerLogin({ workerData: 'worker' })

    worker.postMessage({ account })
    handleWorkerMessages(worker, account, mainWindow)

    if (account.platformName === 'P88Bet') {
      if (!workerCrawlP88) {
        workerCrawlP88 = handler.createWorkerCrawl({ workerData: 'worker' })

        workerCrawlP88.postMessage('Start')
        workerCrawlP88.on('message', async ({ type, idAccount }) => {
          if (type == 'LogHandleDataP88') {
            await sendPlatformUpdate('P88Bet', mainWindow)
          }

          if (type === 'DataUpdateAccount') {
            sendAccountUpdate(idAccount, mainWindow)
          }

          if (type === 'LoggedAgain') {
            sendAccountUpdate(idAccount, mainWindow)
            enqueueWorker(Account.findById(idAccount), mainWindow)
          }
        })

        workerCrawlP88.on('exit', async () => {
          console.log('WorkerCrawlP88 Exit')
          workerCrawlP88 = null
        })
      }
    }
    if (account.platformName === 'Sbobet') {
      if (!workerCrawlSbobet) {
        workerCrawlSbobet = handler.createWorkerCrawl({ workerData: 'worker' })

        workerCrawlSbobet.postMessage('Start')
        workerCrawlSbobet.on('message', async ({ type, idAccount }) => {
          if (type == 'LogHandleDataSbobet') {
            await sendPlatformUpdate('Sbobet', mainWindow)
          }

          if (type === 'DataUpdateAccount') {
            sendAccountUpdate(idAccount, mainWindow)
          }

          if (type === 'LoggedAgain') {
            sendAccountUpdate(idAccount, mainWindow)
            enqueueWorker(Account.findById(idAccount), mainWindow)
          }
        })
      }
    }
    if (account.platformName === PLATFORM.WBET) {
      if (!workerCrawlWbet) {
        workerCrawlWbet = handler.createWorkerCrawl({ workerData: 'worker' })

        workerCrawlWbet.postMessage('Start')
        workerCrawlWbet.on('message', async ({ type, idAccount }) => {
          if (type == 'LogHandleDataWbet') {
            await sendPlatformUpdate(PLATFORM.WBET, mainWindow)
          }

          if (type === 'DataUpdateAccount') {
            sendAccountUpdate(idAccount, mainWindow)
          }

          if (type === 'LoggedAgain') {
            sendAccountUpdate(idAccount, mainWindow)
            enqueueWorker(Account.findById(idAccount), mainWindow)
          }
        })

        workerCrawlWbet.on('exit', async () => {
          console.log('Worker Crawl Wbet Exit')
          workerCrawlWbet = null
        })
      }
    }
    if (account.platformName === PLATFORM['3IN1BET']) {
      if (!workerCrawl3in1bet) {
        workerCrawl3in1bet = handler.createWorkerCrawl({ workerData: 'worker' })

        workerCrawl3in1bet.postMessage('Start')
        workerCrawl3in1bet.on('message', async ({ type, idAccount }) => {
          if (type == 'LogHandleData3in1bet') {
            await sendPlatformUpdate(PLATFORM['3IN1BET'], mainWindow)
          }

          if (type === 'DataUpdateAccount') {
            sendAccountUpdate(idAccount, mainWindow)
          }

          if (type === 'LoggedAgain') {
            sendAccountUpdate(idAccount, mainWindow)
            enqueueWorker(Account.findById(idAccount), mainWindow)
          }
        })

        workerCrawl3in1bet.on('exit', async () => {
          console.log('Worker Crawl 3IN2BET Exit')
          workerCrawl3in1bet = null
        })
      }
    }
  }

  if (!workerAutoLogin) {
    workerAutoLogin = createWorkerAutoLogin({ workerData: 'worker' })
    workerAutoLogin.on('message', async (listAccount: AccountType[]) => {
      for (const account of listAccount) {
        Account.update(
          {
            id: account.id
          },
          { status: 'In-Progress', textLog: 'Waiting for login...' }
        )
        sendAccountUpdate(account.id, mainWindow)
        enqueueWorker(account, mainWindow)
      }
    })

    workerAutoLogin.on('exit', (code) => {
      console.log('Exit WorkerAutoLogin...', code)
    })

    workerAutoLogin.on('error', (error) => {
      console.error('WorkerAutoLogin error:', error)
    })
  }

  initializeWorkerPairAndPlaceBet(mainWindow)
}

function handleWorkerMessages(worker: Worker, account: AccountType, mainWindow: BrowserWindow) {
  worker.on('message', async ({ type, data }) => {
    if (type === 'TooManyRequests') {
      sendAccountUpdate(account.id, mainWindow)
      const timeoutId = setTimeout(() => {
        startWorker(account, mainWindow)
        clearTimeout(timeoutId)
      }, 8000)
    }

    if (type === 'DataUpdateAccount') {
      sendAccountUpdate(account.id, mainWindow)
    }

    if (type === 'LoginSuccess') {
      console.log(`LoginSuccess, Create Worker Crawl Viva88: [${account.loginID}]`)

      const workerCrawlViva88 = createWorkerCrawlViva88({ workerData: 'worker' })
      workerCrawlViva88.postMessage(data)
      workerCrawlViva88.on('message', ({ type, data }) => {
        if (type === 'DataUpdateAccount') {
          sendAccountUpdate(account.id, mainWindow)
        }

        if (type === 'DataViva88') {
          if (!workerHandleDataViva88) {
            workerHandleDataViva88 = createWorkerHandleDataViva88({ workerData: 'worker' })
          }
          workerHandleDataViva88.postMessage({ data })
        }

        if (type == 'LoggedAgain') {
          sendAccountUpdate(account.id, mainWindow)
          enqueueWorker(data, mainWindow)
        }
      })

      workerCrawlViva88.on('exit', async () => {
        console.log(`Worker Crawl Viva88 Exit: [${account.loginID}]`)
      })
    }
  })

  worker.on('exit', async (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`)
    }
    console.log(`Worker Login Exit: [${account.loginID}]`)

    const handler = platformHandlers[account.platformName]
    handler.isProcessing = false
    handler.processor(mainWindow)
  })

  worker.on('error', (error) => {
    console.error('Worker error:', error)
  })
}

function initializeWorkerPairAndPlaceBet(mainWindow: BrowserWindow) {
  if (!workerPlaceBet) {
    workerPlaceBet = createWorkerPlaceBet({ workerData: 'worker' })
    workerPlaceBet.postMessage('Start')

    workerPlaceBet.on('message', async ({ type, recordDB }) => {
      if (!mainWindow.isDestroyed()) {
        switch (type) {
          case 'WaitingListDone':
            await sendCount('TotalWaitingList', WaitingList, mainWindow)
            break

          case 'BetList': {
            await handleBetList(recordDB, mainWindow)
            break
          }

          case 'ContraList': {
            await sendCount('TotalContraList', ContraList, mainWindow)
            await handleContraList(recordDB, mainWindow)
            await handleBetList(recordDB, mainWindow)
            break
          }

          case 'SuccessList': {
            await sendCount('TotalSuccessList', SuccessList, mainWindow)
            await handleSuccessList(recordDB, mainWindow)
            await handleBetList(recordDB, mainWindow)
            break
          }

          default:
            await handleBetList(recordDB, mainWindow)
            break
        }
      }
    })

    workerPlaceBet.on('exit', (code) => {
      console.log('Exit workerPlaceBet...', code)
    })

    workerPlaceBet.on('error', (error) => {
      console.error('WorkerPlaceBet error:', error)
    })
  }
}

export function checkQueue(account: AccountType) {
  const handler = platformHandlers[account.platformName]
  handler.queue = handler.queue.filter((item: AccountType) => item.id !== account.id)
}

export function checkQueuePlatform(namePlatform: string) {
  const handler = platformHandlers[namePlatform]
  handler.queue = []
}

export function createWorkerScheduledLoginSetting(mainWindow: BrowserWindow) {
  const workerScheduledLogin = createWorkerScheduledLogin({ workerData: 'worker' })

  workerScheduledLogin.on('message', async (listAccount: AccountType[]) => {
    for (const account of listAccount) {
      Account.update(
        {
          id: account.id
        },
        { status: 'In-Progress', textLog: 'Waiting for login...' }
      )
      sendAccountUpdate(account.id, mainWindow)

      enqueueWorker(account, mainWindow)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  })

  workerScheduledLogin.on('exit', (code) => {
    console.log('Exit workerScheduledLogin...', code)
  })

  workerScheduledLogin.on('error', (error) => {
    console.error('workerScheduledLogin error:', error)
  })
}

export function createWorkerScheduledLogoutSetting(mainWindow: BrowserWindow) {
  const workerScheduledLogout = createWorkerScheduledLogout({ workerData: 'worker' })

  workerScheduledLogout.on('message', async (listAccount: AccountType[]) => {
    for (const account of listAccount) {
      handleLogoutAccount(account, mainWindow)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  })

  workerScheduledLogout.on('exit', (code) => {
    console.log('Exit workerScheduledLogout...', code)
  })

  workerScheduledLogout.on('error', (error) => {
    console.error('workerScheduledLogout error:', error)
  })
}

type SwitchWorkerFn = (
  platformName: string,
  mainWindow: BrowserWindow,
  data: SportsBook,
  isOn: boolean
) => void

const workerMap: Record<string, SwitchWorkerFn> = {
  P88Bet: startWorkerSwitchP88,
  Viva88Bet: startWorkerSwitchViva,
  Sbobet: startWorkerSwitchSbobet,
  WBet: startWorkerSwitchWBet,
  '3in1Bet': startWorkerSwitch3IN1Bet
}

export function enqueueWorkerSwitchAccount(
  platformName: string,
  mainWindow: BrowserWindow,
  data: SportsBook,
  isOn: boolean
) {
  const workerFn = workerMap[platformName]
  if (workerFn) {
    workerFn(platformName, mainWindow, data, isOn)
  } else {
    console.warn(`No worker found for platform: ${platformName}`)
  }
}

export async function startWorkerSwitchP88(platformName: string, mainWindow, data, isOn) {
  if (isOn) {
    if (!workerSwitchAccountP88) {
      workerSwitchAccountP88 = createWorkerSwitchAccountP88({ workerData: 'worker' })
      setTimeout(
        () => {
          workerSwitchAccountP88?.postMessage({
            action: 'Start',
            data: {
              platformName: platformName,
              valueSwitch: data
            }
          })
        },
        Number(data.switchIntervalSettingMinutes) * 60 * 1000
      )
      workerSwitchAccountP88.on('message', (msg) => {
        if (msg.accountResult1) {
          UpdateAccountByPlatFormSwitch(msg.accountResult1)
          UpdateAccountSwitchByPlatFormSwitch(msg.accountResult2, platformName)
          if (msg.accountResult1.checkBoxAutoLogin === 1) {
            enqueueWorker(msg.accountResult1, mainWindow)
          }

          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('DataUpdateSwitch', msg.accountResult1)
          }
        }
      })

      workerSwitchAccountP88.on('exit', (code) => {
        console.log('Exit WorkerSwitchAccount...', code)
        workerSwitchAccountP88 = null
      })

      workerSwitchAccountP88.on('error', (error) => {
        console.error('WorkerSwitchAccount error:', error)
      })
    }
  } else {
    if (workerSwitchAccountP88) {
      workerSwitchAccountP88.terminate()
      workerSwitchAccountP88 = null
      console.log('Worker đã bị tắt.')
    }
  }
}

export async function startWorkerSwitchViva(platformName: string, mainWindow, data, isOn) {
  if (isOn) {
    if (!workerSwitchAccountViva) {
      workerSwitchAccountViva = createWorkerSwitchAccountViva({ workerData: 'worker' })
      setTimeout(
        () => {
          workerSwitchAccountViva?.postMessage({
            action: 'Start',
            data: {
              platformName: platformName,
              valueSwitch: data
            }
          })
        },
        Number(data.switchIntervalSettingMinutes) * 60 * 1000
      )
      workerSwitchAccountViva.on('message', (msg) => {
        if (msg.accountResult1) {
          UpdateAccountByPlatFormSwitch(msg.accountResult1)
          UpdateAccountSwitchByPlatFormSwitch(msg.accountResult2, platformName)
          if (msg.accountResult1.checkBoxAutoLogin === 1) {
            enqueueWorker(msg.accountResult1, mainWindow)
          }

          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('DataUpdateSwitch', msg.accountResult1)
          }
        }
      })

      workerSwitchAccountViva.on('exit', (code) => {
        console.log('Exit WorkerSwitchAccount...', code)
        workerSwitchAccountViva = null
      })

      workerSwitchAccountViva.on('error', (error) => {
        console.error('WorkerSwitchAccount error:', error)
      })
    }
  } else {
    if (workerSwitchAccountViva) {
      workerSwitchAccountViva.terminate()
      workerSwitchAccountViva = null
      console.log('Worker đã bị tắt.')
    }
  }
}

export async function startWorkerSwitchSbobet(platformName: string, mainWindow, data, isOn) {
  if (isOn) {
    if (!workerSwitchAccountSbobet) {
      workerSwitchAccountSbobet = createWorkerSwitchAccountSbobet({ workerData: 'worker' })
      setTimeout(
        () => {
          workerSwitchAccountSbobet?.postMessage({
            action: 'Start',
            data: {
              platformName: platformName,
              valueSwitch: data
            }
          })
        },
        Number(data.switchIntervalSettingMinutes) * 60 * 1000
      )
      workerSwitchAccountSbobet.on('message', (msg) => {
        if (msg.accountResult1) {
          UpdateAccountByPlatFormSwitch(msg.accountResult1)
          UpdateAccountSwitchByPlatFormSwitch(msg.accountResult2, platformName)
          if (msg.accountResult1.checkBoxAutoLogin === 1) {
            enqueueWorker(msg.accountResult1, mainWindow)
          }

          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('DataUpdateSwitch', msg.accountResult1)
          }
        }
      })

      workerSwitchAccountSbobet.on('exit', (code) => {
        console.log('Exit WorkerSwitchAccount...', code)
        workerSwitchAccountSbobet = null
      })

      workerSwitchAccountSbobet.on('error', (error) => {
        console.error('WorkerSwitchAccount error:', error)
      })
    }
  } else {
    if (workerSwitchAccountSbobet) {
      workerSwitchAccountSbobet.terminate()
      workerSwitchAccountSbobet = null
      console.log('Worker đã bị tắt.')
    }
  }
}

export async function startWorkerSwitchWBet(platformName: string, mainWindow, data, isOn) {
  if (isOn) {
    if (!workerSwitchAccountWbet) {
      workerSwitchAccountWbet = createWorkerSwitchAccountWBet({ workerData: 'worker' })
      setTimeout(
        () => {
          workerSwitchAccountWbet?.postMessage({
            action: 'Start',
            data: {
              platformName: platformName,
              valueSwitch: data
            }
          })
        },
        Number(data.switchIntervalSettingMinutes) * 60 * 1000
      )
      workerSwitchAccountWbet.on('message', (msg) => {
        if (msg.accountResult1) {
          UpdateAccountByPlatFormSwitch(msg.accountResult1)
          UpdateAccountSwitchByPlatFormSwitch(msg.accountResult2, platformName)
          if (msg.accountResult1.checkBoxAutoLogin === 1) {
            enqueueWorker(msg.accountResult1, mainWindow)
          }

          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('DataUpdateSwitch', msg.accountResult1)
          }
        }
      })

      workerSwitchAccountWbet.on('exit', (code) => {
        console.log('Exit WorkerSwitchAccount...', code)
        workerSwitchAccountWbet = null
      })

      workerSwitchAccountWbet.on('error', (error) => {
        console.error('WorkerSwitchAccount error:', error)
      })
    }
  } else {
    if (workerSwitchAccountWbet) {
      workerSwitchAccountWbet.terminate()
      workerSwitchAccountWbet = null
      console.log('Worker đã bị tắt.')
    }
  }
}

export async function startWorkerSwitch3IN1Bet(platformName: string, mainWindow, data, isOn) {
  if (isOn) {
    if (!workerSwitchAccount3IN1bet) {
      workerSwitchAccount3IN1bet = createWorkerSwitchAccount3IN1Bet({ workerData: 'worker' })
      setTimeout(
        () => {
          workerSwitchAccount3IN1bet?.postMessage({
            action: 'Start',
            data: {
              platformName: platformName,
              valueSwitch: data
            }
          })
        },
        Number(data.switchIntervalSettingMinutes) * 60 * 1000
      )
      workerSwitchAccount3IN1bet.on('message', (msg) => {
        if (msg.accountResult1) {
          UpdateAccountByPlatFormSwitch(msg.accountResult1)
          UpdateAccountSwitchByPlatFormSwitch(msg.accountResult2, platformName)
          if (msg.accountResult1.checkBoxAutoLogin === 1) {
            enqueueWorker(msg.accountResult1, mainWindow)
          }

          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('DataUpdateSwitch', msg.accountResult1)
          }
        }
      })

      workerSwitchAccount3IN1bet.on('exit', (code) => {
        console.log('Exit WorkerSwitchAccount...', code)
        workerSwitchAccount3IN1bet = null
      })

      workerSwitchAccount3IN1bet.on('error', (error) => {
        console.error('WorkerSwitchAccount error:', error)
      })
    }
  } else {
    if (workerSwitchAccount3IN1bet) {
      workerSwitchAccount3IN1bet.terminate()
      workerSwitchAccount3IN1bet = null
      console.log('Worker đã bị tắt.')
    }
  }
}
