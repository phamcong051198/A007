import { Outlet } from 'react-router-dom'
import AppSidebar from '@renderer/layouts/AppSidebar'
import AppTopBar from '@renderer/layouts/AppTopBar'

const LayoutContent: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="flex h-screen ">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppTopBar />

          <div className="mt-[32px] flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

const AppLayout: React.FC = () => {
  return <LayoutContent />
}

export default AppLayout
