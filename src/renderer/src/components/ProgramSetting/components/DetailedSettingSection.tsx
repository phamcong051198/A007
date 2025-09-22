import { Checkbox } from '@renderer/components/ui/checkbox'
import { Label } from '@renderer/components/ui/label'
import { getBetText } from '@renderer/lib/getBetText'
import { CHECK_BOX_DETAIL_SETTING } from '@shared/renderer/constants'

export const DetailedSettingsSection = ({
  disable,
  typeAccount,
  handleShowPopupLineRange,
  dataTarget,
  setDataTarget
}) => {
  const dataAccountPair = dataTarget[`${typeAccount}`]

  const isBetSelected = dataAccountPair.generalSetting === 'BetSelected'

  const updateField = (field: string, value: number) => {
    setDataTarget((prev) => {
      return {
        ...prev,
        [typeAccount]: {
          ...prev[typeAccount],
          [field]: value
        }
      }
    })
  }
  const updateCheckBox = (key: string, value: boolean) => {
    updateField(key, Number(value))
  }
  const handleLineRangeClick = (key: string) => {
    handleShowPopupLineRange(key, typeAccount)
  }
  return (
    <div className="pt-4">
      <div className="text-sm font-semibold text-[#85888E] mb-4">Detailed Settings</div>
      <div className="grid grid-cols-2 gap-4">
        {['FT', 'Half'].map((category) => (
          <div key={category} className="flex flex-col gap-1.5 space-y-2">
            <h6 className="text-gray-400 text-sm font-medium">{category}</h6>
            {CHECK_BOX_DETAIL_SETTING.filter((cb) => cb.key.startsWith(category)).map(
              ({ key, label }) => {
                const labelTextBetTo = getBetText(dataAccountPair[`${key}_Detail`]?.betTo)
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className="flex gap-2 col-span-4 items-center">
                      <Checkbox
                        disabled={!isBetSelected || disable}
                        id={`${key}_${typeAccount}`}
                        checked={Boolean(dataAccountPair[key])}
                        onCheckedChange={(checked) => updateCheckBox(key, checked as boolean)}
                      />
                      <Label
                        className="cursor-pointer text-gray-300 text-sm"
                        htmlFor={`${key}_${typeAccount}`}
                      >
                        {label}
                      </Label>
                    </div>
                    <div className="relative col-span-2">
                      <p
                        className={`${dataAccountPair[key] === 1 ? 'block' : 'hidden'} cursor-pointer underline italic text-blue-400 text-sm ${isBetSelected ? '' : 'opacity-50'}`}
                        onClick={() => isBetSelected && handleLineRangeClick(key)}
                      >
                        {key.includes('PK') ? '' : labelTextBetTo}
                      </p>
                    </div>
                    <div className="relative col-span-3">
                      <p
                        className={`${dataAccountPair[key] === 1 ? 'block' : 'hidden'} cursor-pointer text-end underline italic text-blue-400 text-sm ${isBetSelected ? '' : 'opacity-50'}`}
                        onClick={() => isBetSelected && handleLineRangeClick(key)}
                      >
                        {dataAccountPair[`${key}_Detail`]?.range.betAll === 1
                          ? 'Range: All'
                          : 'Range: Custom'}
                      </p>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
