import { Worker } from 'worker_threads'
import { BrowserWindow } from 'electron'

import createWorkerCrawlP88 from './platform/P88/workerCrawl?nodeWorker'
import createWorkerLoginP88 from './platform/P88/workerLogin?nodeWorker'

import createWorkerLoginSbobet from './platform/Sbobet/workerLogin?nodeWorker'
import createWorkerCrawlSbobet from './platform/Sbobet/workerCrawl?nodeWorker'

import createWorkerCrawlViva88 from './platform/Viva88/workerCrawl?nodeWorker'
import createWorkerHandleDataViva88 from './platform/Viva88/workerHandleData?nodeWorker'
import createWorkerLoginViva88 from './platform/Viva88/workerLogin?nodeWorker'

import createWorkerLoginWbet from './platform/Wbet/workerLogin?nodeWorker'
import createWorkerCrawlWbet from './platform/Wbet/workerCrawl?nodeWorker'

import createWorkerLogin3IN1Bet from './platform/3In1bet/workerLogin?nodeWorker'
import createWorkerCrawl3IN1Bet from './platform/3In1bet/workerCrawl?nodeWorker'

import createWorkerAutoLogin from './workerAutoLogin?nodeWorker'
import createWorkerPlaceBet from './workerPlaceBet?nodeWorker'

import handleBetList from '@/worker/lib/handleBetList'
import handleContraList from '@/worker/lib/handleContraList'
import handleSuccessList from '@/worker/lib/handleSuccessList'

import { sendAccountUpdate } from '@/worker/lib/sendAccountUpdate'
import { sendCount } from '@/worker/lib/sendCount'
import { Account, ContraList, SuccessList, WaitingList } from '@db/model'
import { sendPlatformUpdate } from '@/worker/lib/sendPlatformUpdate'
import { QueueHandler } from '@shared/main/types'
import { PLATFORM } from '@shared/main/constants'
import { AccountType } from '@shared/common/types'

let workerCrawlP88: Worker | null = null
let workerCrawlWbet: Worker | null = null
let workerCrawlSbobet: Worker | null = null
let workerCrawl3in1bet: Worker | null = null

let workerHandleDataViva88: Worker | null = null

let workerPlaceBet: Worker | null = null
let workerAutoLogin: Worker | null = null

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
