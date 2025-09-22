import TopSportsBookPerMatchLimitSettingWindow from '@renderer/components/SportsBookPerMatchLimitSetting/TopSportsBookPerMatchLimitSettingWindow'
import BottomSportsBookPerMatchLimitSettingWindow from '@renderer/components/SportsBookPerMatchLimitSetting/BottomSportsBookPerMatchLimitSettingWindow'
import FooterSave from '@renderer/components/SportsBookPerMatchLimitSetting/FooterSave'

export default function SportsBookPerMatchLimitSetting() {
  return (
    <div className="flex flex-col h-full w-full">
      <TopSportsBookPerMatchLimitSettingWindow />
      <BottomSportsBookPerMatchLimitSettingWindow />
      <div className="flex justify-end">
        <FooterSave />
      </div>
    </div>
  )
}
