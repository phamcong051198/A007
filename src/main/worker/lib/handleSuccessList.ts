import { clearTable, SettingTableView, SuccessList } from '@db/model'
import { SettingTableViewType } from '@shared/common/types'
import { BrowserWindow } from 'electron'

async function handleSuccessList(recordDB, mainWindow: BrowserWindow): Promise<void> {
  const SettingTableViewSuccessList = SettingTableView.findOne({
    tab: 'SuccessList'
  }) as SettingTableViewType

  const count = SuccessList.count()
  const clearThreshold = SettingTableViewSuccessList.clear === 1 ? 100 : 1000

  if (count > clearThreshold) {
    clearTable('SuccessList')
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  mainWindow.webContents.send('DataSuccessList', recordDB)
  await new Promise((resolve) => setTimeout(resolve, 100))
}

export default handleSuccessList
