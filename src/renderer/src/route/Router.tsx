import { Routes, Route, HashRouter, Navigate } from 'react-router-dom'
import { Path } from '@renderer/route/Path'
import Main from '@renderer/windows/Main'
import Login from '@renderer/windows/Login'
import SportsBook from '@renderer/pages/SportsBook'
import SportsBookTab from '@renderer/components/SportsBook/SportsBookTab'
import ProgramSetting from '@renderer/pages/ProgramSetting'
import GeneralSetting from '@renderer/components/ProgramSetting/GeneralSetting'
import AccountPair from '@renderer/components/ProgramSetting/AccountPair'
import Language from '@renderer/components/ProgramSetting/Language'
import BetList from '@renderer/pages/BetList'
import WaitingList from '@renderer/pages/WaitingList'
import ContraList from '@renderer/pages/ContraList'
import SuccessList from '@renderer/pages/SuccessList'
import LeagueData from '@renderer/pages/League Data'

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
          <Route path="league-data" element={<LeagueData />} />
          <Route path="program-settings" element={<ProgramSetting />}>
            <Route index element={<Navigate to="general-setting" replace />} />
            <Route path="general-setting" element={<GeneralSetting />} />
            <Route path="account-pair" element={<AccountPair />} />
            <Route path="language" element={<Language />} />
          </Route>
        </Route>
        <Route path={Path.login} element={<Login />} />
      </Routes>
    </HashRouter>
  )
}

export default Router
