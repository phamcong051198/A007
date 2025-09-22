import OddsTypeSetting from '@renderer/components/Setting/OddsTypeSetting'
import GameType from '@renderer/components/Setting/GameType'
import OddsSetting from '@renderer/components/Setting/OddsSetting'
import BetAmountRandomizer from '@renderer/components/Setting/BetAmountRandomizer'
import GameTypeScheduler from '@renderer/components/Setting/GameTypeScheduler'
import BoxLabel from '@renderer/layouts/BoxLabel'
import BettingMode from '@renderer/components/Setting/BettingMode'
import FirstStHalf from '@renderer/components/Setting/FirstStHalf'
import SecondStHalf from '@renderer/components/Setting/SecondStHalf'
import ButtonSaveSettings from '@renderer/components/Setting/ButtonSaveSettings'

export default function Setting() {
  return (
    <div className="bg-layout-color p-3 h-full flex flex-col">
      <div className="grid gap-3.5 grid-cols-2">
        <OddsTypeSetting />
      </div>
      <div className="flex mt-4 w-full justify-between">
        <GameType />
        <GameTypeScheduler />
      </div>
      <div className="mt-4">
        <BoxLabel label="General Setting" className="w-full p-[5px]">
          <div className="mt-3">
            <FirstStHalf />
          </div>
          <div className="mt-5">
            <SecondStHalf />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="flex-1">
              <BettingMode />
            </div>
            <div className="flex-1">
              <OddsSetting />
            </div>
          </div>
          <div className="mt-3">
            <BetAmountRandomizer />
          </div>
        </BoxLabel>
      </div>

      <div className="flex-1 mt-4"></div>
      <div className="text-right mt-1.5 mr-0 ">
        <ButtonSaveSettings />
      </div>
    </div>
  )
}
