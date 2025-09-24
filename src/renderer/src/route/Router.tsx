import { Routes, Route, HashRouter, Navigate } from 'react-router-dom'
import { Path } from '@renderer/route/Path'
import Main from '@renderer/windows/Main'
import Setting from '@renderer/windows/Setting'
import Login from '@renderer/windows/Login'
import ProxyServerSettingsGeneral from '@renderer/windows/ProxyServerSettingsGeneral'
import SportsBookPerMatchLimitSetting from '@renderer/windows/SportsBookPerMatchLimitSetting'
import { SettingProvider } from '@renderer/context/SettingContext'
import { PerMatchLimitSettingProvider } from '@renderer/context/PerMatchLimitSettingContext'
import { AccountPairProvider } from '@renderer/context/AccountPairContext'
import { BetSettingProvider } from '@renderer/context/BetSettingContext'
import SportsBook from '@renderer/pages/SportsBook'
import SportsBookTab from '@renderer/components/SportsBook/SportsBookTab'
import ProgramSetting from '@renderer/pages/ProgramSetting'
import GeneralSetting from '@renderer/components/ProgramSetting/GeneralSetting'
import AccountPair from '@renderer/components/ProgramSetting/AccountPair'
import SportsPerMatchLimit from '@renderer/components/ProgramSetting/SportsPerMatchLimit'
import ProxySetting from '@renderer/components/ProgramSetting/ProxySetting'
import Language from '@renderer/components/ProgramSetting/Language'
import BetSetting from '@renderer/components/ProgramSetting/BetSetting'
import BetList from '@renderer/pages/BetList'
import WaitingList from '@renderer/pages/WaitingList'
import ContraList from '@renderer/pages/ContraList'
import SuccessList from '@renderer/pages/SuccessList'
import { LeagueFilterProvider } from '@renderer/context/LeagueFilterContext'
import LeagueFilter from '@renderer/pages/LeagueFilter'

function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path={Path.main} element={<Main />}>
          <Route index element={<Navigate to="sports-book/sports-book1" replace />} />
          <Route path="sports-book" element={<SportsBook />}>
            <Route index element={<Navigate to="sports-book1" replace />} />
            <Route path=":id" element={<SportsBookTab />} />
          </Route>
          <Route path="bet-list" element={<BetList />} />
          <Route path="waiting-list" element={<WaitingList />} />
          <Route path="contra-list" element={<ContraList />} />
          <Route path="success-list" element={<SuccessList />} />
          <Route
            path="league-filter"
            element={
              <LeagueFilterProvider>
                <LeagueFilter />
              </LeagueFilterProvider>
            }
          />
          <Route path="program-settings" element={<ProgramSetting />}>
            <Route index element={<Navigate to="general-setting" replace />} />
            <Route path="general-setting" element={<GeneralSetting />} />
            <Route
              path="bet-setting"
              element={
                <BetSettingProvider>
                  <BetSetting />
                </BetSettingProvider>
              }
            />
            <Route path="account-pair" element={<AccountPair />} />
            <Route
              path="sportsbook-per-match-limit"
              element={
                <PerMatchLimitSettingProvider>
                  <SportsPerMatchLimit />
                </PerMatchLimitSettingProvider>
              }
            />
            <Route path="proxy-setting" element={<ProxySetting />} />
            <Route path="language" element={<Language />} />
          </Route>
        </Route>

        <Route
          path={Path.setting}
          element={
            <SettingProvider>
              <Setting />
            </SettingProvider>
          }
        />
        <Route
          path={Path.accountPair}
          element={
            <AccountPairProvider>
              <AccountPair />
            </AccountPairProvider>
          }
        />
        <Route path={Path.login} element={<Login />} />
        <Route path={Path.proxyServerSettingsGeneral} element={<ProxyServerSettingsGeneral />} />
        <Route
          path={Path.sportsBookPerMatchLimitSetting}
          element={
            <PerMatchLimitSettingProvider>
              <SportsBookPerMatchLimitSetting />
            </PerMatchLimitSettingProvider>
          }
        />
      </Routes>
    </HashRouter>
  )
}

export default Router
