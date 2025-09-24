import clsx from 'clsx'
import { CheckCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import BookOpen from '@renderer/icons/book-open'
import ChevronLeft from '@renderer/icons/chevron-left'
import ChevronRight from '@renderer/icons/chevron-right'
import File from '@renderer/icons/file'
import SwitchHorizontal from '@renderer/icons/switch-horizontal'
import ClipBoard from '@renderer/icons/clipboard'
import LineChartUp from '@renderer/icons/line-chart-up'
import DataFlow from '@renderer/icons/dataflow'
import Settings from '@renderer/icons/settings'
import Feature from '@renderer/icons/feature'
import { getThemeClass } from '@shared/common/constants'
import { PasswordChangeModal } from '@renderer/components/PasswordChangeModal'
import { useSidebar } from '@renderer/context/SidebarContext'
import { useCount } from '@renderer/context/CountContext'

type NavItem = {
  name: string
  icon: React.ReactNode
  path: string
  badgeKey?: string
}

const navItems: NavItem[] = [
  { icon: <BookOpen />, name: 'SportsBook', path: 'sports-book' },
  { icon: <File />, name: 'Bet List', path: 'bet-list' },
  { icon: <ClipBoard />, name: 'Waiting List', path: 'waiting-list', badgeKey: 'totalWaitingList' },
  {
    icon: <SwitchHorizontal />,
    name: 'Contra List',
    path: 'contra-list',
    badgeKey: 'totalContraList'
  },
  {
    icon: <LineChartUp />,
    name: 'Success List',
    path: 'success-list',
    badgeKey: 'totalSuccessList'
  },
  { icon: <DataFlow />, name: 'League Filter', path: 'league-filter' }
]

const NavItemComponent = ({
  item,
  collapsed,
  isActive
}: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
}) => {
  const { totalBetList, totalWaitingList, totalContraList, totalSuccessList } = useCount()
  const badgeValueMap: Record<string, number> = {
    totalBetList,
    totalWaitingList,
    totalContraList,
    totalSuccessList
  }

  const badgeValue = item.badgeKey ? badgeValueMap[item.badgeKey] : null
  return (
    <Link to={item.path} title={collapsed ? item.name : ''}>
      <li
        className={clsx(
          'flex items-center px-4 py-[10px] my-[4px] rounded-[6px] hover:bg-[#22262F]',
          isActive && 'bg-[#22262F]'
        )}
      >
        <span className="relative menu-item-icon-size">
          {item.icon}
          {badgeValue !== null && badgeValue > 0 && (
            <span
              className={`${'bg-blue-color'} absolute -top-[12px] -left-[10px] bg-blue-color min-w-[18px] text-white text-[9px] p-1 rounded-full leading-none flex items-center justify-center`}
            >
              {badgeValue}
            </span>
          )}
        </span>
        {!collapsed && <span className="leading-none font-semibold ml-2">{item.name}</span>}
      </li>
    </Link>
  )
}

const BREAKPOINT = 1166

const AppSidebar: React.FC = () => {
  const [isBreakpoint, setIsBreakpoint] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= BREAKPOINT : false
  )

  const { collapsed, setCollapsed } = useSidebar()
  const location = useLocation()
  const toggleSidebar = () => setCollapsed((prev) => !prev)
  const username = localStorage.getItem('username')
  const expiredDate = localStorage.getItem('expiredDate')
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')
  const [noticeUpdate, setNoticeUpdate] = useState(() => {
    const savedNotice = sessionStorage.getItem('noticeUpdate')
    return savedNotice ? JSON.parse(savedNotice) : false
  })

  // user popup state
  const [showUserPopup, setShowUserPopup] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const userContainerRef = useRef<HTMLDivElement | null>(null)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)

  const toggleUserPopup = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShowUserPopup((s) => !s)
  }

  const openPasswordModal = () => {
    setShowPasswordModal(true)
    setShowUserPopup(false) // Hide popup when modal opens
  }

  const resetPasswordForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    resetPasswordForm()
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      setPasswordError('Current password is required')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    try {
      // Call your electron IPC to change password
      const result = await window.electron.ipcRenderer.invoke('ChangePassword', {
        currentPassword,
        newPassword
      })
      // Success - close form
      closePasswordModal()
      // You might want to show a success notification here
      setShowSaveSuccess(true)
      setMessageSuccess('Save successful!')
      setTimeout(() => {
        setShowSaveSuccess(false)
      }, 1500)
    } catch (error) {
      setPasswordError((error as Error).message || 'Failed to change password')
    }
  }

  useEffect(() => {
    const updateAvailableListener = () => {
      setNoticeUpdate(true)
      sessionStorage.setItem('noticeUpdate', JSON.stringify(true))
    }
    window.electron.ipcRenderer.on('UpdateAvailable', updateAvailableListener)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('UpdateAvailable')
    }
  }, [])

  // close user popup on outside click or Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!userContainerRef.current) return
      if (!userContainerRef.current.contains(e.target as Node)) {
        setShowUserPopup(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserPopup(false)
      }
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // --- Breakpoint logic ---
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia(`(max-width: ${BREAKPOINT}px)`)

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : mq.matches
      setIsBreakpoint((prev) => (prev === matches ? prev : matches))
    }

    handler(mq)

    if ('addEventListener' in mq) {
      mq.addEventListener('change', handler as EventListener)
    } else {
      // @ts-ignore legacy
      mq.addListener(handler)
    }

    return () => {
      if ('removeEventListener' in mq) {
        mq.removeEventListener('change', handler as EventListener)
      } else {
        // @ts-ignore legacy
        mq.removeListener(handler)
      }
    }
  }, [])

  useEffect(() => {
    setCollapsed(isBreakpoint)
  }, [isBreakpoint])
  // --- end breakpoint logic ---

  return (
    <>
      <aside className="h-full flex flex-col  transition-all duration-300 ease-in-out border-r border-border-default">
        {/* Logo + Toggle */}
        <div
          className={clsx('flex items-center m-[20px]', {
            'justify-center': collapsed,
            'justify-between': !collapsed
          })}
        >
          {!collapsed && (
            <Link to="sports-book">
              <img src={'images/logo-main-app.png'} alt="Logo" className="cursor-pointer" />
            </Link>
          )}
          <button className="cursor-pointer" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        <div className={clsx('flex-1 flex flex-col justify-between ', { 'w-[215px]': !collapsed })}>
          {/* Nav Items */}
          <ul className="list-none mx-3">
            {navItems.map((item, index) => (
              <NavItemComponent
                key={index}
                item={item}
                collapsed={collapsed}
                isActive={location.pathname.includes(item.path)}
              />
            ))}
          </ul>

          {/* Footer */}
          <div className="px-3 pb-5">
            {/* Settings */}
            <ul className="list-none mb-4">
              <Link to="program-settings">
                <li
                  className={clsx(
                    'flex items-center px-4 py-[10px] my-[2px] hover:bg-[#22262F] rounded-[6px]',
                    location.pathname.includes('program-settings') && 'bg-[#22262F]'
                  )}
                  title={collapsed ? 'Program Settings' : ''}
                >
                  <span className="menu-item-icon-size">
                    <Settings />
                  </span>
                  {!collapsed && (
                    <span className="leading-none font-semibold ml-2">Program Settings</span>
                  )}
                </li>
              </Link>
            </ul>

            {/* Feature Box */}
            {noticeUpdate && (
              <div
                className={clsx('mb-4 rounded-[6px]', {
                  'p-4 bg-[#13161B]': !collapsed
                })}
              >
                <div className={clsx({ 'flex justify-center': collapsed })}>
                  <Feature />
                </div>
                {!collapsed && (
                  <div className="mt-2">
                    <p className="text-white">Update available</p>
                    <span className="text-[#94979C] text-xs">
                      The app will update when the app is closed.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Admin Info + user popup */}
            <div className="border-t border-border-default pt-4">
              <div className="flex items-center px-1 relative" ref={userContainerRef}>
                <button
                  type="button"
                  onClick={openPasswordModal}
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white focus:outline-none',
                    getThemeClass('bg')
                  )}
                  aria-expanded={showUserPopup}
                  title="User"
                >
                  {username?.charAt(0) ?? profile?.username?.charAt(0)}
                </button>

                {!collapsed && (
                  <div
                    className="ml-2 cursor-pointer"
                    onClick={toggleUserPopup}
                    role="button"
                    tabIndex={0}
                    aria-label="User info"
                  >
                    <p className="text-white text-sm">{username ?? profile?.username}</p>
                    <p className="text-[#94979C] text-sm">
                      EXP:
                      <span className={getThemeClass('text')}>
                        {' '}
                        {expiredDate
                          ? new Date(expiredDate).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })
                          : profile?.expiredDate
                            ? new Date(profile.expiredDate).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : '--/--/----'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
      {showSaveSuccess && (
        <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{messageSuccess}</span>
        </div>
      )}
      {showPasswordModal && (
        <PasswordChangeModal
          account={{
            userName: username ?? profile?.username,
            expiredDate: expiredDate
              ? new Date(expiredDate).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : profile?.expiredDate
                ? new Date(profile.expiredDate).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                : '--/--/----'
          }}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          passwordError={passwordError}
          handlePasswordSubmit={handlePasswordSubmit}
          onClose={closePasswordModal}
        />
      )}
    </>
  )
}

export default AppSidebar
