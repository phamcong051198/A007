import { enqueueWorkerSwitchAccount } from '@/worker'

export function handleSwitchListAccount(platform, mainWindow, data, isOn) {
  enqueueWorkerSwitchAccount(platform, mainWindow, data, isOn)
}
