import { Label } from '@renderer/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { PerMatchLimitSettingContext } from '@renderer/context/PerMatchLimitSettingContext'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { SettingPerMatchLimitType } from '@shared/common/types'
import React, { useCallback, useContext } from 'react'

const TopSportsBookPerMatchLimitSettingWindow = () => {
  const context = useContext(PerMatchLimitSettingContext)
  if (!context) return null

  const {
    showDisable,
    setShowDisable,
    listPlatform,
    setListPlatform,
    selectedPlatform,
    setSelectedPlatform
  } = context

  const updatePlatform = useCallback(
    (update: Partial<SettingPerMatchLimitType>) => {
      setListPlatform(update as SettingPerMatchLimitType)
      setSelectedPlatform(update as SettingPerMatchLimitType)
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
    (field: 'totalAmount' | 'totalCount') => (e: React.ChangeEvent<HTMLInputElement>) =>
      updatePlatform({ [field]: e.target.value }),
    [updatePlatform]
  )

  const handlePlatformClick = useCallback(
    (platform: SettingPerMatchLimitType) => setSelectedPlatform(platform),
    [setSelectedPlatform]
  )

  return (
    <div className="bg-layout-color border h-[190px] pb-3 pt-4 px-[2px]">
      <BoxLabel label="Per Match Limit Setting" className="w-full">
        <div className="flex flex-col h-full gap-2">
          <div className="flex cursor-pointer items-center mb-1 ml-3 mt-4 mx-1">
            <input
              id="bordered-checkbox-1"
              type="checkbox"
              checked={showDisable}
              name="bordered-checkbox"
              className="bg-gray-100 border-gray-300 h-4 text-red-600 w-4 cursor-pointer mr-1"
              onChange={() => setShowDisable()}
            />
            <label htmlFor="bordered-checkbox-1" className="text-sm cursor-pointer font-bold ms-1">
              Enabled
            </label>
          </div>
          <div className="flex flex-1 overflow-hidden relative">
            <div className="bg-white border border-gray-500 w-60 custom-scrollbar overflow-auto">
              {listPlatform.map((platform: SettingPerMatchLimitType) => {
                return (
                  <p
                    key={platform.id}
                    className={`pl-1 hover:bg-blue-500 hover:text-white cursor-pointer ${
                      selectedPlatform.id === platform.id ? 'bg-blue-500 text-white' : ''
                    }`}
                    onClick={() => handlePlatformClick(platform)}
                  >
                    {platform.namePlatform}
                  </p>
                )
              })}
            </div>
            <div className="flex-1 pt-2">
              <BoxLabel label="Per Match Limit" className="w-[460px]">
                <div className="flex flex-col h-full gap-4 pt-4 px-2">
                  <div className="flex gap-2">
                    <div className="w-28">Limit Method</div>
                    <div>
                      <RadioGroup
                        className="flex justify-center"
                        value={selectedPlatform.limitMethod}
                        onValueChange={handleRadioGroupChangeLimitMethod}
                      >
                        <div className="flex flex-col gap-5">
                          <div className="flex">
                            <div className="flex w-48 items-center space-x-2">
                              <RadioGroupItem value="TeamName" id="TeamName" className="bg-white" />
                              <Label htmlFor="TeamName" className="font-normal">
                                Team Name
                              </Label>
                            </div>
                            {/* <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="TeamNameHandicap"
                                id="TeamNameHandicap"
                                className="bg-white"
                                disabled
                              />
                              <Label htmlFor="TeamNameHandicap" className="font-normal">
                                Team Name + Handicap
                              </Label>
                            </div> */}
                          </div>
                          {/* <div className="flex">
                            <div className="flex w-48 items-center space-x-2">
                              <RadioGroupItem
                                value="NameBetTypeLimit"
                                id="NameBetTypeLimit"
                                className="bg-white"
                                disabled
                              />
                              <Label htmlFor="NameBetTypeLimit" className="font-normal">
                                Name BetType Limit
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="NameTargetLimit"
                                id="NameTargetLimit"
                                className="bg-white"
                                disabled
                              />
                              <Label htmlFor="NameTargetLimit" className="font-normal">
                                Name & Target Limit
                              </Label>
                            </div>
                          </div> */}
                        </div>
                      </RadioGroup>
                      {/* <div className="flex cursor-pointer items-center mb-1 mt-4">
                        <input
                          disabled
                          id="LivePreGame"
                          type="checkbox"
                          checked={Boolean(selectedPlatform.livePreGame)}
                          name="LivePreGame"
                          onChange={handleLivePreGameChange}
                          className="bg-gray-100 border-gray-300 h-4 text-red-600 w-4 cursor-pointer mr-1"
                        />
                        <label htmlFor="LivePreGame" className="text-sm cursor-pointer ms-1">
                          Live /Pre-Game
                        </label>
                      </div> */}
                    </div>
                  </div>
                  {/* <div className="text-[#0000FF]">
                    <p>*Name & BetType Limit: Name + (HDP / OU / 1X2)</p>
                    <p>*Name & Target Limit: Name + (FTHome / FTAway / FHOver / FHUnder...)</p>
                  </div> */}
                  <div className="flex gap-2">
                    <div className="w-28">Limit Type</div>
                    <div className="flex-1">
                      <RadioGroup
                        className="flex"
                        value={selectedPlatform.limitType}
                        onValueChange={handleRadioGroupChangeLimitType}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center">
                            <div className="flex w-48 items-center space-x-2">
                              <RadioGroupItem
                                value="TotalAmount"
                                id="TotalAmount"
                                className="bg-white"
                              />
                              <Label htmlFor="TotalAmount" className="font-normal">
                                Limit By Total Amount $
                              </Label>
                            </div>

                            <input
                              className="border border-gray-400 w-28 block outline-none"
                              type="number"
                              id="InputLimitByTotalAmount"
                              value={selectedPlatform.totalAmount}
                              step={100}
                              onChange={handleInputChange('totalAmount')}
                              disabled={selectedPlatform.limitType !== 'TotalAmount'}
                            />
                          </div>
                          <div className="flex items-center">
                            <div className="flex w-48 items-center space-x-2">
                              <RadioGroupItem
                                value="TotalCount"
                                id="TotalCount"
                                className="bg-white"
                              />
                              <Label htmlFor="TotalCount" className="font-normal">
                                Limit By Total Count
                              </Label>
                            </div>

                            <input
                              className="border border-gray-400 w-28 block outline-none"
                              type="number"
                              id="InputLimitByTotalCount"
                              value={selectedPlatform.totalCount}
                              onChange={handleInputChange('totalCount')}
                              disabled={selectedPlatform.limitType !== 'TotalCount'}
                            />
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </BoxLabel>
            </div>

            {!showDisable && (
              <div
                className="bg-layout-color absolute bottom-0 left-[-2px] opacity-80 pointer-events-auto right-0 top-[-11px] z-50"
                style={{ width: '676px', height: '252px' }}
              />
            )}
          </div>
        </div>
      </BoxLabel>
    </div>
  )
}

export default React.memo(TopSportsBookPerMatchLimitSettingWindow)
