import { Worker, WorkerOptions } from 'worker_threads'

import { BrowserWindow } from 'electron'

import { AccountType, ListRangePlatformType, OtherSettingType } from '@shared/common/types'

export type DataBetSettingPayload = {
  rangePlatforms: ListRangePlatformType[]
  otherSetting: OtherSettingType
}

export type QueueHandler = {
  queue: AccountType[]
  isProcessing: boolean
  createWorkerLogin: (options: WorkerOptions) => Worker
  createWorkerCrawl: (options: WorkerOptions) => Worker
  processor: (mainWindow: BrowserWindow) => void
}

export type TicketForDelaySecType = {
  id: number

  platform: string
  company: string
  idLeague: number
  idEvent: number
  number: number
  type: string
  hdp_point: string
  bet: string
  timestamp: string
}
export type SchedulerType = {
  schedulerRunning: number
  schedulerInputRunning: string
  schedulerToday: number
  schedulerInputToday: string
  schedulerEarly: number
  schedulerInputEarly: string
}

export type BetData = {
  info: string
  receiptID: string
  receiptStatus: string
}
