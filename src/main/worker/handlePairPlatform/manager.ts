/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserWindow } from 'electron'
import { PlatformPairType } from '@db/schema/platformPair'
import createWorker from './worker?nodeWorker'
import { PlatformPair } from '@db/model'
import handleBetList from '@/worker/lib/handleBetList'

const activeWorkers = new Map()

export const platformPairStatusManager = (mainWindow: BrowserWindow) => {
  const listPlatformPair = PlatformPair.findAll() as PlatformPairType[]
  const newPairs = listPlatformPair.map((item) => item.key)
  console.log('List key PlatformPair', newPairs)
  newPairs.forEach((pair) => {
    if (!activeWorkers.has(pair)) {
      const worker = createWorker({ workerData: { pair } })

      worker.on('message', async (msg) => {
        if (!mainWindow.isDestroyed()) {
          if (msg.type == 'BetList') {
            await handleBetList(msg.recordDB, mainWindow)
          } else {
            console.log(`Worker [${pair}] say: ${msg}`)
          }
        }
      })

      worker.on('error', (err) => {
        console.error(`Worker [${pair}] error:`, err)
        activeWorkers.delete(pair)
      })

      worker.on('exit', (code) => {
        console.log(`Worker [${pair}] exited with code ${code}`)
        activeWorkers.delete(pair)
      })

      activeWorkers.set(pair, worker)
      console.log(`Worker [${pair}] created.`)
    }
  })

  for (const existingPair of activeWorkers.keys()) {
    if (!newPairs.includes(existingPair)) {
      const workerToRemove = activeWorkers.get(existingPair)
      workerToRemove.terminate()
      activeWorkers.delete(existingPair)
      console.log(`🗑️ Worker [${existingPair}] terminated.`)
    }
  }
}
