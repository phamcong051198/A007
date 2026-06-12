import clsx from 'clsx'

import ListEventBetList from '@renderer/components/BetList/ListEventBetList'
import { useSidebar } from '@renderer/context/SidebarContext'

function BetList() {
  const { collapsed } = useSidebar()

  return (
    <div className=" h-[99%] p-[12px] flex flex-col">
      <div className="font-semibold text-2xl mb-[20px]">Bet List</div>
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div
          className={clsx('h-full', collapsed ? 'w-[calc(100vw-120px)]' : 'w-[calc(100vw-240px)]')}
        >
          <ListEventBetList />
        </div>
      </div>
    </div>
  )
}

export default BetList
