import { SportsBook } from '@shared/common/types'
import { parentPort } from 'worker_threads'
import {
  GetListAccountByPlatForm,
  GetListAccountSwitchWorkerByPlatform
} from '../../lib/getAccountListByFlatform'
import { switchProxy } from '@/worker/lib/switchProxy'

if (!parentPort) throw new Error('IllegalState')

let platformName = ''
let valueSwitch = {} as SportsBook

parentPort.on('message', async (message) => {
  if (message.action === 'Start') {
    console.log('Worker started...')
    platformName = message.data.platformName
    valueSwitch = message.data.valueSwitch
    switchAccount()
  } else if (message.action === 'UpdateData') {
    platformName = message.data.platformName
    valueSwitch = message.data.valueSwitch
  }
})

async function switchAccount() {
  try {
    const listAccountByPlatform = await GetListAccountByPlatForm(platformName)

    const listAccountSwitchByPlatform = await GetListAccountSwitchWorkerByPlatform(platformName)

    const { accountResult1, accountResult2 } = switchProxy(
      listAccountByPlatform,
      listAccountSwitchByPlatform,
      valueSwitch.accountType
    )

    parentPort?.postMessage({ accountResult1, accountResult2 })

    setTimeout(switchAccount, Number(valueSwitch.switchIntervalSettingMinutes) * 60 * 1000)
  } catch (error) {
    console.error('❌ Error in switchAccount_3in1Bet:', error)
  }
}
