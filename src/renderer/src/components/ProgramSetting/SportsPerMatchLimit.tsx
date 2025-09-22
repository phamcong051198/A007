import { CheckCircle } from 'lucide-react'
import { useCallback, useContext, useState, useEffect } from 'react'

import { SwitchCustom } from '../ui/switch'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { InputNumber } from '../ui/input-number'
import SportsDataTable, { GameData } from './components/SportsDataTable'
import { PerMatchLimitSettingContext } from '@renderer/context/PerMatchLimitSettingContext'
import { SettingPerMatchLimitType } from '@shared/common/types'
import { validateAndUpdateData } from '@renderer/lib/validateAndUpdateData'
import { Button } from '../ui/button'
import { getThemeClass } from '@shared/common/constants'

export default function SportsPerMatchLimit() {
  const context = useContext(PerMatchLimitSettingContext)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  if (!context) return null

  const {
    showDisable,
    setShowDisable,
    listPlatform,
    setListPlatform,
    selectedPlatform,
    setSelectedPlatform
  } = context

  const [data, setData] = useState<GameData[]>([])

  const updatePlatform = useCallback(
    (update: Partial<SettingPerMatchLimitType>) => {
      setListPlatform({ ...selectedPlatform, ...update })
      setSelectedPlatform({ ...selectedPlatform, ...update })
    },
    [selectedPlatform, setListPlatform, setSelectedPlatform]
  )

  const handleRadioGroupChangeLimitMethod = useCallback(
    (value: string) => updatePlatform({ limitMethod: value }),
    [updatePlatform]
  )

  const handleRadioGroupChangeLimitType = useCallback(
    (value: string) => updatePlatform({ limitType: value }),
    [updatePlatform]
  )

  const handleInputChange = useCallback(
    (field: 'totalAmount' | 'totalCount') => (value: number | string) =>
      updatePlatform({ [field]: String(value) }),
    [updatePlatform]
  )

  const handlePlatformClick = useCallback(
    (platform: SettingPerMatchLimitType) => setSelectedPlatform(platform),
    [setSelectedPlatform]
  )

  useEffect(() => {
    if (!selectedPlatform?.namePlatform || selectedPlatform.namePlatform === 'Per-Match Details') {
      return
    }

    let interval: NodeJS.Timeout | null = null
    let isMounted = true

    const fetchData = async () => {
      try {
        const data = await window.electron?.ipcRenderer?.invoke(
          'PerMatchLimitDetailPlatform',
          selectedPlatform.namePlatform
        )

        if (isMounted && data) {
          setData(data)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching data:', error)
        }
      }
    }

    fetchData()
    interval = setInterval(fetchData, 1000)

    return () => {
      isMounted = false
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }
  }, [selectedPlatform])

  const headerItem = { id: 1, name: 'SportsBook', isHeader: true }

  const handleSave = () => {
    const updatedListPlatform = listPlatform.map(validateAndUpdateData)
    window.electron.ipcRenderer.send('CloseSportsBookPerMatchLimitSetting', {
      enable: +showDisable,
      listPlatform: updatedListPlatform
    })
    setShowSaveSuccess(true)
    setMessageSuccess('Save successful!')
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 1500)
  }

  return (
    <div className={`bg-layout-color flex flex-col h-auto mt-4`}>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="block">
          <div className="w-80 bg-[#0C0E12] rounded-lg border border-[#22262F] overflow-hidden">
            <div className="px-4 py-3 bg-[#0C0E12] font-semibold text-gray-200 border-b border-[#22262F]">
              {headerItem.name}
            </div>

            <div className="overflow-y-auto h-35">
              {listPlatform.map((platform, index) => (
                <div
                  key={platform.id}
                  className={`px-4 py-3 text-gray-300 bg-[#0C0E12]  cursor-pointer
              
                    ${
                      selectedPlatform.id === platform.id ? getThemeClass('bg') : ''
                    } ${index !== listPlatform.length - 1 ? 'border-b border-[#22262F]' : ''}`}
                  onClick={() => handlePlatformClick(platform)}
                >
                  {platform.namePlatform}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full relative">
          <div className="flex justify-between w-full">
            <div>Per-match limit</div>
            <div>
              <SwitchCustom checked={showDisable} onCheckedChange={setShowDisable} />
            </div>
          </div>
          <div className="flex w-full">
            <div className="w-1/3">
              <div>Limit method</div>
            </div>
            <div className="w-2/3">
              <RadioGroup
                className="w-full"
                value={selectedPlatform.limitMethod}
                onValueChange={handleRadioGroupChangeLimitMethod}
                disabled={!showDisable}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TeamName" id="TeamName" disabled={!showDisable} />
                  <Label htmlFor="TeamName" className="font-normal">
                    Team Name
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="flex w-full">
            <div className="w-1/3">
              <div>Limit Type</div>
            </div>
            <div className="w-2/3">
              <RadioGroup
                className="w-full grid gap-4"
                value={selectedPlatform.limitType}
                onValueChange={handleRadioGroupChangeLimitType}
                disabled={!showDisable}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-1/2">
                    <RadioGroupItem value="TotalAmount" id="TotalAmount" disabled={!showDisable} />
                    <Label htmlFor="TotalAmount" className="font-normal">
                      Limit By Total Amount $
                    </Label>
                  </div>
                  <InputNumber
                    precision={0}
                    min={0}
                    step={100}
                    value={Number(selectedPlatform.totalAmount)}
                    onChange={(value) => handleInputChange('totalAmount')(value || 0)}
                    disabled={!showDisable || selectedPlatform.limitType !== 'TotalAmount'}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2  w-1/2">
                    <RadioGroupItem value="TotalCount" id="TotalCount" disabled={!showDisable} />
                    <Label htmlFor="TotalCount" className="font-normal">
                      Limit By Total Count
                    </Label>
                  </div>
                  <InputNumber
                    precision={0}
                    min={0}
                    step={1}
                    value={Number(selectedPlatform.totalCount)}
                    onChange={(value) => handleInputChange('totalCount')(value || 0)}
                    disabled={!showDisable || selectedPlatform.limitType !== 'TotalCount'}
                    className="w-32"
                  />
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 w-full flex-grow">
        <SportsDataTable
          title={`Match Data - ${selectedPlatform.namePlatform}`}
          total={data.length}
          showScroll={true}
          showSaveReport={true}
          data={(data.length > 0 ? data : []) as GameData[]}
          enableHorizontalScroll={true}
          maxHeight="max-h-[500px]"
        />
      </div>
      <div className="flex justify-end space-x-2 mt-4 py-5 pr-5">
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
      {showSaveSuccess && (
        <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{messageSuccess}</span>
        </div>
      )}
    </div>
  )
}
