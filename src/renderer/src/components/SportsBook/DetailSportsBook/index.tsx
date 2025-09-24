import React from 'react'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { DataPlatformType } from '@shared/common/types'
import AccountPlatform from '@renderer/components/SportsBook/DetailSportsBook/AccountPlatform'
import { NotificationError } from '@renderer/components/NotificationPopup/NotificationError'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import QuickActionsPlatform from '@renderer/components/SportsBook/DetailSportsBook/QuickActions'
import AddAccount from '@renderer/components/SportsBook/DetailSportsBook/AddAccount'
import DeletePlatform from '@renderer/components/SportsBook/DetailSportsBook/DeletePlatform'
import HeaderListAccount from '@renderer/components/SportsBook/DetailSportsBook/HeaderListAccount'

interface DetailSportsBookProps {
  sportsBook: DataPlatformType
  setVisible: Dispatch<SetStateAction<boolean>>
  setPosition: Dispatch<
    SetStateAction<{
      x: number
      y: number
    }>
  >
  setPlatform: Dispatch<SetStateAction<DataPlatformType | null>>
}

const DetailSportsBook: React.FC<DetailSportsBookProps> = ({
  sportsBook,
  setVisible,
  setPosition,
  setPlatform
}) => {
  const [inputs, setInputs] = useState({
    delayNormal: sportsBook.delayNormal,
    delaySameGame: sportsBook.delaySameGame,
    switchIntervalSetting_from: sportsBook.switchIntervalSetting_from,
    switchIntervalSetting_to: sportsBook.switchIntervalSetting_to,
    switchIntervalSettingMinutes: sportsBook.switchIntervalSettingMinutes,
    accountSwitchSettingOFF: sportsBook.accountType,
    switchAccountSetting: sportsBook.switchAccountSetting
  })

  const [showAlertError, setShowAlertError] = useState(false)

  const handleContextMenu = (event) => {
    setPlatform(sportsBook)
    event.preventDefault()
    setVisible(true)
    setPosition({
      x: event.clientX,
      y: event.clientY
    })
  }

  const handleAddAccount = () => {
    if (sportsBook.accounts.length === 300) {
      setShowAlertError(true)
      return
    }

    window.electron.ipcRenderer.send('AddAccountPlatForm', {
      platformName: sportsBook.platform,
      loginURL: sportsBook.url
    })
  }

  return (
    <div className="min-w-[800px] mb-[32px] border border-border-default rounded-[12px]">
      <div className="flex rounded-t-md items-center">
        <div className="h-full flex-1">
          <div className="flex items-center px-[11px] py-[1px] justify-between rounded-t-[11px] bg-bg-gray border-b border-border-default">
            <p className="text-[18px] font-semibold">{sportsBook.platform}</p>

            <div className=" border-gray-500 flex items-center gap-[12px]">
              <QuickActionsPlatform sportsBook={sportsBook} />
              <AddAccount handleAddAccount={handleAddAccount} sportsBook={sportsBook} />
              <DeletePlatform sportsBook={sportsBook} />
            </div>
          </div>

          <HeaderListAccount />
        </div>
      </div>
      <div className="pb-[16px]" onContextMenu={handleContextMenu}>
        {sportsBook.accounts &&
          sportsBook.accounts.length > 0 &&
          sportsBook.accounts.map((account, index) => (
            <AccountPlatform
              key={account.id}
              account={account}
              index={index}
              highlight={sportsBook.hight_account}
            />
          ))}
      </div>
      <NotificationError
        showAlertDialog={showAlertError}
        setShowAlertDialog={setShowAlertError}
        title="Notification"
        messageError="Account addition limit reached"
        ReactElement={<ExclamationTriangle className="size-11 text-[#FF8C00] mr-1" />}
      />
    </div>
  )
}

export default React.memo(DetailSportsBook)
