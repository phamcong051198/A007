import { useContext, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { LeagueFilterContext } from '@renderer/context/LeagueFilterContext'
import { Button } from '@renderer/components/ui/button'
import FilterType from '@renderer/components/League/FilterType'
import BodyLeagueFilter from '@renderer/components/League/BodyLeagueFilter'
import ListLeague_Add from '@renderer/components/League/ListLeague_Add'
import FooterLeagueFilter from '@renderer/components/League/FooterLeagueFilter'

export default function LeagueFilter() {
  const context = useContext(LeagueFilterContext)
  if (!context) return null
  const { filterType } = context.filterType
  const { listBlockLeagueTable, listAllowLeagueTable } = context.tableData as {
    listBlockLeagueTable: { id: string | number; league: string }[]
    setListBlockLeagueTable: React.Dispatch<
      React.SetStateAction<{ id: string | number; league: string }[]>
    >
    listAllowLeagueTable: { id: string | number; league: string }[]
    setListAllowLeagueTable: React.Dispatch<
      React.SetStateAction<{ id: string | number; league: string }[]>
    >
  }
  const { blockMajorLeague, setBlockMajorLeague, allowMajorLeague, setAllowMajorLeague } =
    context.actionCheckBoxMajorLeague
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const reset = () => {
    context.filterType.setFilterType('Block')

    // Reset major league checkboxes
    setBlockMajorLeague(0)
    setAllowMajorLeague(0)

    // Clear all league tables
    context.tableData.setListBlockLeagueTable([])
    context.tableData.setListAllowLeagueTable([])

    // Show success message
    setShowSaveSuccess(true)
    setMessageSuccess('All changes have been reset!')
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 1500)
  }

  const save = () => {
    window.electron.ipcRenderer.send('DataLeagueFilter', {
      filterType,
      blockMajorLeague,
      allowMajorLeague,
      listAllowLeagueTable,
      listBlockLeagueTable
    })
    setShowSaveSuccess(true)
    setMessageSuccess('Save successful!')
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 1500)
  }
  const handleCancel = () => {
    window.history.back()
  }
  return (
    <>
      <div className="bg-layout-color flex flex-col">
        <div className="flex justify-between items-center px-4">
          <h1 className="text-lg font-bold ">League Filter</h1>

          <div className="flex justify-end space-x-2 py-5 pr-5">
            <Button variant="plain-white" size="sm" className="text-white" onClick={reset}>
              Reset all changes
            </Button>
            <Button
              variant="bordered-white"
              size="sm"
              className="border-red"
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button size="sm" onClick={save}>
              Save
            </Button>
          </div>
        </div>
        <div className="flex">
          <div className="w-2/3 rounded-lg mx-4 border border-[#22262F] ">
            {/* <BodyLeagueFilter /> */}
            <div className="flex flex-col">
              <FilterType />
              <div className="flex flex-col ">
                {/* <HeaderLeagueFilter /> */}
                <BodyLeagueFilter />
              </div>
            </div>
          </div>
          <div className="w-1/3 pb-5 border-b-[#22262F]">
            <ListLeague_Add />
          </div>
        </div>
        <FooterLeagueFilter />

        {showSaveSuccess && (
          <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{messageSuccess}</span>
          </div>
        )}
      </div>
    </>
  )
}
