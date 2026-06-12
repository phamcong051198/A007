import clsx from 'clsx'

import ListEventWaitingList from '@renderer/components/WaitingList/ListEventWaitingList'
import { useSidebar } from '@renderer/context/SidebarContext'

function WaitingList() {
  const { collapsed } = useSidebar()
  return (
    <div className=" h-[99%] p-[12px] flex flex-col">
      <div className="font-semibold text-2xl mb-[20px]">Waiting List</div>
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div
          className={clsx('h-full', collapsed ? 'w-[calc(100vw-120px)]' : 'w-[calc(100vw-240px)]')}
        >
          <ListEventWaitingList />
        </div>
      </div>
    </div>
  )
}

export default WaitingList
