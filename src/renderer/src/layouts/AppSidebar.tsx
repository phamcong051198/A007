import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'

import { useCount } from '@renderer/context/CountContext'
import { useSidebar } from '@renderer/context/SidebarContext'
import BookOpen from '@renderer/icons/book-open'
import ChevronLeft from '@renderer/icons/chevron-left'
import ChevronRight from '@renderer/icons/chevron-right'
import ClipBoard from '@renderer/icons/clipboard'
import DataFlow from '@renderer/icons/dataflow'
import File from '@renderer/icons/file'
import LineChartUp from '@renderer/icons/line-chart-up'
import Settings from '@renderer/icons/settings'
import SwitchHorizontal from '@renderer/icons/switch-horizontal'

import { getThemeClass } from '@shared/common/constants'

type NavItem = {
  name: string
  icon: React.ReactNode
  path: string
  badgeKey?: string
}

const navItems: NavItem[] = [
  { icon: <BookOpen />, name: 'SportsBook', path: 'sports-book' },
  { icon: <File />, name: 'Bet List', path: 'bet-list' },
  { badgeKey: 'totalWaitingList', icon: <ClipBoard />, name: 'Waiting List', path: 'waiting-list' },
  {
    badgeKey: 'totalContraList',
    icon: <SwitchHorizontal />,
    name: 'Contra List',
    path: 'contra-list'
  },
  {
    badgeKey: 'totalSuccessList',
    icon: <LineChartUp />,
    name: 'Success List',
    path: 'success-list'
  },
  { icon: <DataFlow />, name: 'League Data', path: 'league-data' }
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
    totalContraList,
    totalSuccessList,
    totalWaitingList
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
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')

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
            'justify-between': !collapsed,
            'justify-center': collapsed
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

            {/* Admin Info + user popup */}
            <div className="border-t border-border-default pt-4">
              <div className="flex items-center px-1 relative">
                <button
                  type="button"
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white focus:outline-none',
                    getThemeClass('bg')
                  )}
                  title="User"
                >
                  {username?.charAt(0) ?? profile?.username?.charAt(0)}
                </button>

                {!collapsed && (
                  <div
                    className="ml-2 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label="User info"
                  >
                    <p className="text-white text-sm">{username ?? profile?.username}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AppSidebar
