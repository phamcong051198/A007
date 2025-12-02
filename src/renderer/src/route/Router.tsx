import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import BetList from '@renderer/pages/BetList'
import ContraList from '@renderer/pages/ContraList'
import LeagueData from '@renderer/pages/League Data'
import ProgramSetting from '@renderer/pages/ProgramSetting'
import SportsBook from '@renderer/pages/SportsBook'
import SuccessList from '@renderer/pages/SuccessList'
import WaitingList from '@renderer/pages/WaitingList'
import { Path } from '@renderer/route/Path'
import Login from '@renderer/windows/Login'
import Main from '@renderer/windows/Main'

import AccountPair from '@renderer/components/ProgramSetting/AccountPair'
import GeneralSetting from '@renderer/components/ProgramSetting/GeneralSetting'
import SportsBookTab from '@renderer/components/SportsBook/SportsBookTab'

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
          </Route>
        </Route>
        <Route path={Path.login} element={<Login />} />
      </Routes>
    </HashRouter>
  )
}

export default Router
