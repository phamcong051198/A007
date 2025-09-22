export default function DeylaySec({
  sportsBook,
  inputs,
  delayLogin,
  settingOff,
  handleInputChange
}) {
  return (
    <div className="text-xs font-bold flex justify-between px-[24px] py-[3px]">
      <div className="flex gap-[12px] items-center ">
        <div className="font-medium"> Delay (sec): </div>
        <div className="flex items-center">
          <p>Normal:</p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            value={inputs.delayNormal}
            onChange={(e) => handleInputChange('delayNormal', e.target.value)}
            className="pl-1 ml-[8px] border border-border-default w-[34px] h-[34px] rounded-[8px] outline-none  font-medium bg-layout-color"
          />
        </div>
        <div className="flex items-center">
          <p>Same Game:</p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            value={inputs.delaySameGame}
            onChange={(e) => handleInputChange('delaySameGame', e.target.value)}
            className="pl-1 ml-[8px] border border-border-default w-[34px] h-[34px] rounded-[8px] outline-none  font-medium  bg-layout-color"
          />
        </div>
      </div>

      <div className=" border-gray-500 flex items-center ml-2">
        {delayLogin && (
          <div className="flex items-center font-medium text-xs text-[#0000FF] ml-2">
            <p>Login next account in {delayLogin} sec</p>
          </div>
        )}
      </div>
      {settingOff === 'on' && (
        <>
          <div className="flex items-center font-medium  ml-2 text-[#0000FF]">
            <p>Switching account in : </p>

            <p> {inputs.switchIntervalSettingMinutes} minutes</p>
          </div>
        </>
      )}
      <div className="flex items-center font-medium ml-2">
        <p>Suggested Client:</p>
        <p className="text-red-500 ml-2 font-bold">{sportsBook.suggestedClient}</p>
      </div>
    </div>
  )
}
