import { Checkbox } from '@renderer/components/ui/checkbox'
import Eye from '@renderer/icons/eye'
import EyeSlash from '@renderer/icons/eye-slash'
import LoadingLogin from '@renderer/windows/Login/LoadingLogin'
import LoadingUpdateApp from '@renderer/windows/Login/LoadingUpdateApp'

import { useCallback, useEffect, useRef, useState } from 'react'

const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

export default function Login() {
  const isAttemptingLogin = useRef(false)

  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingUpdateApp, setLoadingUpdateApp] = useState(false)

  const [username, setUserName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isSaveLogin, setIsSaveLogin] = useState<boolean>(() => {
    const savedState = localStorage.getItem('isSaveLogin')
    return savedState !== null ? JSON.parse(savedState) : false
  })

  useEffect(() => {
    localStorage.setItem('isSaveLogin', JSON.stringify(isSaveLogin))

    if (isSaveLogin) {
      const savedUserName = localStorage.getItem('username')
      const savedPassword = localStorage.getItem('password')
      if (savedUserName && savedPassword) {
        setUserName(savedUserName)
        setPassword(savedPassword)
      }
    } else {
      localStorage.removeItem('username')
      localStorage.removeItem('password')
    }
  }, [isSaveLogin])

  const CloseLoginWindow = useCallback(() => {
    window.electron.ipcRenderer.send('CloseLoginWindow')
  }, [])

  const checkInternetConnection = () => {
    return navigator.onLine
  }

  const handleLogin = useCallback(() => {
    if (isAttemptingLogin.current) return

    setErrorMessage('')

    if (!username || !password) {
      setErrorMessage('Please enter both username and password.')
      return
    }

    if (!checkInternetConnection()) {
      setErrorMessage('No internet. Please check your connection and try again.')
      return
    }
    setLoadingLogin(true)
    isAttemptingLogin.current = true
    window.electron.ipcRenderer.send('AttemptLogin', { username, password })

    window.electron.ipcRenderer.once('LoginResult', (_event, { success, message, data }) => {
      setLoadingLogin(false)
      isAttemptingLogin.current = false
      if (success) {
        const profile = {
          username: username,
          expiredDate: data?.account?.expiredDate || '',
          password: password
        }

        localStorage.setItem('profile', JSON.stringify(profile))
        if (isSaveLogin) {
          localStorage.setItem('username', username)
          localStorage.setItem('password', password)
          localStorage.setItem('expiredDate', data?.account?.expiredDate)
        } else {
          localStorage.removeItem('username')
          localStorage.removeItem('password')
          localStorage.removeItem('expiredDate')
        }
      } else {
        setErrorMessage(message || 'Login failed. Please try again.')
        localStorage.removeItem('profile')
      }
    })

    window.electron.ipcRenderer.once('setToken', (_event, { accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    })
  }, [username, password, isSaveLogin])

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSaveLogin(e.target.checked)
    if (!e.target.checked) {
      localStorage.removeItem('username')
      localStorage.removeItem('password')
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleLogin()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleLogin])

  useEffect(() => {
    const showLoading = () => setLoadingUpdateApp(true)
    window.electron.ipcRenderer.on('show-loading', showLoading)
    return () => {
      window.electron.ipcRenderer.removeAllListeners('show-loading')
    }
  }, [])

  return (
    <div className="h-full py-[64px] px-[48px] border border-border-default">
      <div className="h-full">
        <div className="mb-[32px]">
          <div className="pb-[16px] flex justify-center">
            <img
              src={isBSoft ? 'images/logo-main-login.png' : 'images/logo-corners-login.png'}
              alt="LogoLogin"
              className="cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-3 items-center">
            <p className="text-white text-3xl">Log in to your account</p>
            <p className="text-base text-[#94979C]">Welcome back! Please enter your details.</p>
          </div>
          <div className="text-[#FF0000] font-semibold text-center h-1 mb-9">
            {errorMessage ?? ''}
          </div>
        </div>

        <div>
          <div>
            <div className="mb-[20px]">
              <p className="text-sm text-[#CECFD2] mb-[6px]">Username</p>
              <input
                type="text"
                maxLength={20}
                className={`${isBSoft ? 'focus:border-blue-color' : 'focus:border-purple-color'} w-full h-[44px] outline-none text-white bg-layout-color border border-border-default rounded-[8px] px-[14px] py-[10px]`}
                value={username}
                onChange={(e) => {
                  setUserName(e.target.value)
                  setErrorMessage('')
                }}
              />
            </div>

            <div>
              <p className="text-sm text-[#CECFD2] mb-[6px]">Password</p>
              <div
                className={`${isBSoft ? 'focus-within:border-blue-color' : 'focus-within:border-purple-color'} border h-[44px] border-border-default rounded-[8px] bg-layout-color flex  items-center justify-between`}
              >
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  maxLength={20}
                  value={password}
                  className="w-full outline-none bg-layout-color text-white px-[14px]"
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrorMessage('')
                  }}
                />
                <button
                  type="button"
                  className=" w-4 text-gray-400 hover:text-gray-200 mr-1"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                >
                  {isPasswordVisible ? <Eye /> : <EyeSlash />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex my-[24px] justify-between">
            <div className="flex items-center">
              <Checkbox
                id="checkboxLogin"
                checked={isSaveLogin}
                onCheckedChange={(checked) => setIsSaveLogin(checked === true)}
                className="mr-[8px]"
              />
              <label htmlFor="checkboxLogin" className="cursor-pointer">
                Remember me
              </label>
            </div>
            <div className="underline cursor-pointer" onClick={handleLogin}>
              Re-update
            </div>
          </div>

          <div>
            <button
              className={`text-white h-[44px] w-full rounded-[8px] mb-[16px] hover:opacity-90 ${isBSoft ? 'bg-blue-color' : 'bg-purple-color'}`}
              onClick={handleLogin}
            >
              Login
            </button>
            <button
              className="text-white h-[44px] w-full rounded-[8px] border border-border-default hover:border-gray-600"
              onClick={CloseLoginWindow}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {loadingLogin && <LoadingLogin isBSoft={isBSoft} />}
      {loadingUpdateApp && <LoadingUpdateApp isBSoft={isBSoft} />}
    </div>
  )
}
