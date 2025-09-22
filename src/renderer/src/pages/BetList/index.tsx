import clsx from 'clsx'
import { useSidebar } from '@renderer/context/SidebarContext'
import ListEventBetList from '@renderer/components/BetList/ListEventBetList'

function BetList() {
  const { collapsed } = useSidebar()

  return (
    <div className="mr-2 h-[99%] p-[24px] flex flex-col">
      <div className="font-semibold text-2xl mb-[20px]">Bet List</div>
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div
          className={clsx('h-full', collapsed ? 'w-[calc(100vw-135px)]' : 'w-[calc(100vw-275px)]')}
        >
          <ListEventBetList />
        </div>
      </div>
    </div>
  )
}

export default BetList
