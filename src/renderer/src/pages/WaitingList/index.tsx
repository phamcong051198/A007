import clsx from 'clsx'
import { useSidebar } from '@renderer/context/SidebarContext'
import ListEventWaitingList from '@renderer/components/WaitingList/ListEventWaitingList'

function WaitingList() {
  const { collapsed } = useSidebar()
  return (
    <div className="mr-2 h-[99%] p-[24px] flex flex-col">
      <div className="font-semibold text-2xl mb-[20px]">Waiting List</div>
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div
          className={clsx('h-full', collapsed ? 'w-[calc(100vw-135px)]' : 'w-[calc(100vw-275px)]')}
        >
          <ListEventWaitingList />
        </div>
      </div>
    </div>
  )
}

export default WaitingList
