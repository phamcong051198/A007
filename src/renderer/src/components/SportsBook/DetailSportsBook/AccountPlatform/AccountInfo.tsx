import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

import { NotificationError } from '@renderer/components/NotificationPopup/NotificationError'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import { Label } from '@renderer/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { validateAndUpdateData } from '@renderer/lib/validateAndUpdateData'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import Eye from '@renderer/icons/eye'
import EyeSlash from '@renderer/icons/eye-slash'

import { getThemeClass, LIMIT_METHOD, LIMIT_TYPE } from '@shared/common/constants'
import { AccountType } from '@shared/common/types'

function AccountInfo({ account }) {
  const { id: activeId } = useParams()
  const [openModalSetting, setOpenModalSetting] = useState(false)

  const [formData, setFormData] = useState({
    limitMethod: 'TeamName',
    limitType: 'TotalCount',
    loginID: '',
    password: '',
    totalAmount: '5000',
    totalCount: '2'
  })
  const [loginID, setUsername] = useState('')
  const [platform, setPlatform] = useState('')

  const [alertConfig, setAlertConfig] = useState({
    message: '',
    title: '',
    visible: false
  })

  const firstInputRef = useRef<HTMLInputElement>(null)

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  useEffect(() => {
    const fetchAccount = async () => {
      const data = (await window.electron.ipcRenderer.invoke(
        'DataAccount',
        account.id
      )) as AccountType
      setPlatform(data.platformName)
      setFormData({
        limitMethod: data.limitMethod,
        limitType: data.limitType,
        loginID: data.loginID || '',
        password: data.password || '',
        totalAmount: data.totalAmount,
        totalCount: data.totalCount
      })
      setUsername(data.loginID)
    }
    fetchAccount()
  }, [openModalSetting])

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [])

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    if (formData.loginID && formData.loginID !== loginID) {
      const isDuplicate = await window.electron.ipcRenderer.invoke('CheckUserNameAccount', {
        platform,
        username: formData.loginID
      })
      if (isDuplicate) {
        setAlertConfig({
          message: 'This account already exists!',
          title: 'Notification',
          visible: true
        })
        return
      }
    }
    const validateFormData = validateAndUpdateData(formData)

    window.electron.ipcRenderer.send('Data_AccountLoginForm', {
      account: {
        id: account.id,
        ...validateFormData
      },
      activeId
    })
    setOpenModalSetting(false)
  }

  return (
    <>
      <div
        className={twMerge(
          'underline cursor-pointer truncate w-[103px]',
          !account.statusPair || !account.loginID || !account.password
            ? ' text-red-color'
            : getThemeClass('text')
        )}
        onClick={() => setOpenModalSetting(true)}
      >
        {account.loginID ? account.loginID : account.platformName}
      </div>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0  rounded-[12px] bg-white flex flex-col gap-0">
          <header className="flex p-[16px] border-b border-border-default">
            <div className="ml-[16px] flex flex-col">
              <div className="flex justify-between">
                <p className="text-lg font-semibold ">Account Information </p>
                <button
                  className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-200 hover:rounded-full"
                  onClick={() => setOpenModalSetting(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 gap-[16px] px-[24px]">
            <div className="flex-1 py-[20px] flex border-b border-border-default">
              <div className="flex-1">
                <div className="flex mb-[8px]">
                  <p className="w-28 mb-[6px] leading-none">Username</p>
                  <input
                    className="flex-1 block bg-transparent border border-border-default rounded-lg py-[6px] px-[14px] focus:border-gray-500"
                    ref={firstInputRef}
                    type="text"
                    value={formData.loginID}
                    onChange={(e) => handleInputChange('loginID', e.target.value)}
                    spellCheck={false}
                    maxLength={20}
                  />
                </div>
                <div className="flex">
                  <p className="w-28 mb-[6px] leading-none">Password</p>
                  <div className="flex flex-1 bg-transparent border border-border-default rounded-lg py-[6px] px-[14px] focus-within:border-gray-500">
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="flex-1 outline-none bg-transparent"
                      spellCheck={false}
                      maxLength={20}
                    />
                    <button
                      type="button"
                      className="text-gray-400 w-4 mr-1"
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                    >
                      {isPasswordVisible ? <Eye /> : <EyeSlash />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 py-[15px]">
              <p className="font-bold pb-2">Per - Match Limit</p>
              <div className="flex flex-col h-full gap-7">
                <div>
                  <div className="text-sm font-semibold pb-2">Limit Method</div>
                  <div>
                    <RadioGroup
                      className="flex justify-center"
                      value={formData.limitMethod}
                      onValueChange={(value) => handleInputChange('limitMethod', value)}
                    >
                      <div className="flex flex-col gap-5">
                        <div className="flex">
                          <div className="flex w-[180px] items-center space-x-2">
                            <RadioGroupItem
                              value={LIMIT_METHOD.TEAM_NAME}
                              id={LIMIT_METHOD.TEAM_NAME}
                            />
                            <Label htmlFor={LIMIT_METHOD.TEAM_NAME} className="font-normal">
                              Team Name
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={LIMIT_METHOD.TEAM_NAME_HANDICAP}
                              id={LIMIT_METHOD.TEAM_NAME_HANDICAP}
                            />
                            <Label
                              htmlFor={LIMIT_METHOD.TEAM_NAME_HANDICAP}
                              className="font-normal"
                            >
                              Team Name + Handicap
                            </Label>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="flex w-[180px] items-center space-x-2">
                            <RadioGroupItem
                              value={LIMIT_METHOD.NAME_BETTYPE_LIMIT}
                              id={LIMIT_METHOD.NAME_BETTYPE_LIMIT}
                              disabled={true}
                            />
                            <Label
                              htmlFor={LIMIT_METHOD.NAME_BETTYPE_LIMIT}
                              className="font-normal"
                            >
                              Name BetType Limit
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={LIMIT_METHOD.NAME_TARGET_LIMIT}
                              id={LIMIT_METHOD.NAME_TARGET_LIMIT}
                              disabled={true}
                            />
                            <Label htmlFor={LIMIT_METHOD.NAME_TARGET_LIMIT} className="font-normal">
                              Name & Target Limit
                            </Label>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold pb-1">Limit Type</div>
                  <div className="flex-1">
                    <RadioGroup
                      className="flex"
                      value={formData.limitType}
                      onValueChange={(value) => handleInputChange('limitType', value)}
                    >
                      <div className="flex flex-col gap-2">
                        {/* Total Amount */}
                        <div className="flex items-center">
                          <div className="flex w-[180px] items-center space-x-2">
                            <RadioGroupItem
                              value={LIMIT_TYPE.TOTAL_AMOUNT}
                              id={LIMIT_TYPE.TOTAL_AMOUNT}
                            />
                            <Label htmlFor={LIMIT_TYPE.TOTAL_AMOUNT} className="font-normal">
                              Limit By Total Amount
                            </Label>
                          </div>

                          <input
                            className={`w-[175px] bg-transparent border border-border-default rounded-lg py-[6px] pl-[14px] pr-[5px] focus:border-gray-500 ${
                              formData.limitType !== LIMIT_TYPE.TOTAL_AMOUNT
                                ? ''
                                : 'border-gray-500'
                            }`}
                            type="number"
                            id="InputLimitByTotalAmount"
                            value={formData.totalAmount}
                            onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                            disabled={formData.limitType !== LIMIT_TYPE.TOTAL_AMOUNT}
                            step={100}
                          />
                        </div>

                        {/* Total Count */}
                        <div className="flex items-center">
                          <div className="flex w-[180px] items-center space-x-2">
                            <RadioGroupItem
                              value={LIMIT_TYPE.TOTAL_COUNT}
                              id={LIMIT_TYPE.TOTAL_COUNT}
                            />
                            <Label htmlFor={LIMIT_TYPE.TOTAL_COUNT} className="font-normal">
                              Limit By Total Count
                            </Label>
                          </div>

                          <input
                            className={`w-[175px] bg-transparent border border-border-default rounded-lg py-[6px] pl-[14px] pr-[5px] focus:border-gray-500 ${
                              formData.limitType !== LIMIT_TYPE.TOTAL_COUNT ? '' : 'border-gray-500'
                            }`}
                            type="number"
                            id="InputLimitByTotalCount"
                            value={formData.totalCount}
                            min={0}
                            onChange={(e) => handleInputChange('totalCount', e.target.value)}
                            disabled={formData.limitType !== LIMIT_TYPE.TOTAL_COUNT}
                          />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="flex gap-[16px] p-[24px]">
            <button
              className="flex-1 outline-none border border-border-default hover:border-gray-700 block h-[40px] font-semibold rounded-[8px]"
              onClick={() => setOpenModalSetting(false)}
            >
              Cancel
            </button>
            <button
              className={`${'bg-blue-color'} text-white flex-1 border-none block h-[40px] font-semibold  hover:bg-opacity-90 rounded-[8px]`}
              onClick={save}
            >
              Save
            </button>
          </footer>
        </AlertDialogContent>
      </AlertDialog>
      <NotificationError
        showAlertDialog={alertConfig.visible}
        setShowAlertDialog={(visible) => setAlertConfig((prev) => ({ ...prev, visible }))}
        title={alertConfig.title}
        messageError={alertConfig.message}
        ReactElement={<ExclamationTriangle className="text-[#FF8C00] mr-1 size-11" />}
      />
    </>
  )
}

export default AccountInfo
