import { getThemeClass } from '@shared/common/constants'
import { useEffect, useState } from 'react'

const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

export default function InitApp() {
  const params = new URLSearchParams(window.location.hash.split('?')[1])
  const versionLatest = params.get('version')
  const currentYear = new Date().getFullYear()

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100))
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.on('init-app-done', () => {
      setProgress(100)
    })

    return () => window.electron.ipcRenderer.removeAllListeners('init-app-done')
  }, [])

  return (
    <div className="h-full flex flex-col items-center bg-black border border-border-default">
      <div className="flex-1 pt-[64px] w-full px-[40px]">
        <div className="flex justify-center mb-[40px]">
          <img
            src={`${isBSoft ? 'images/logo-main-login.png' : 'images/logo-corners-login.png'}`}
            alt="LogoLogin"
            className="cursor-pointer"
          />
        </div>
        <div className="flex flex-col items-center mt-8 w-full ">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className={getThemeClass('bg') + ` h-full transition-all duration-200`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm ">Loading...</p>
        </div>
      </div>
      <div className="text-xs text-[#94979C] px-[16px] py-[4px]">
        Version {versionLatest} {isBSoft ? 'SpeedWin' : 'CornerPro'} Vietnam © {currentYear}
      </div>
    </div>
  )
}
