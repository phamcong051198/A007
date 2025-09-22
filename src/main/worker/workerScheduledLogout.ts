import { getCurrentDateTime } from '@/worker/lib/getCurrentDateTime'
import { isScheduledTime } from '@/worker/lib/isScheduledTime'
import { Account, LoginSchedulerSetting } from '@db/model'
import { AccountType, LoginSchedulerSettingType } from '@shared/common/types'
import { parentPort } from 'worker_threads'

type GetCurrentDateTime = { currentDate: string; dayOfWeek: string; currentTime: string }
const port = parentPort
if (!port) throw new Error('IllegalState')

// Delay 1 minutes
const numberDelay = 60

setInterval(() => {
  const loginSchedulerSetting = LoginSchedulerSetting.findOne({
    typeSetting: 'Logout'
  }) as LoginSchedulerSettingType
  const dataCurrentDateTime = getCurrentDateTime() as GetCurrentDateTime

  const isCheckScheduledTime = isScheduledTime(dataCurrentDateTime, loginSchedulerSetting)

  if (isCheckScheduledTime) {
    const listAccount = Account.findAll({
      status: 'Logout',
      statusDelete: 0
    }) as AccountType[]
    if (listAccount.length) {
      port.postMessage(listAccount)
    }
  }
}, numberDelay * 1000)
