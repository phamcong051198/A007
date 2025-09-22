import React, { useContext, useState } from 'react'
import { NotificationSave } from '@renderer/components/NotificationPopup/NotificationSave'
import { LeagueFilterContext } from '@renderer/context/LeagueFilterContext'
import InformationCircle from '@renderer/icons/information-circle'

const FooterLeagueFilter = () => {
  const context = useContext(LeagueFilterContext)
  if (!context) return null

  const { filterType } = context.filterType
  const { blockMajorLeague, allowMajorLeague } = context.actionCheckBoxMajorLeague

  const { setEnableEditLeagueFilter } = context.editLeagueFilter
  const { listAllowLeagueTable, listBlockLeagueTable } = context.tableData as {
    listAllowLeagueTable: { id: string | number; league: string }[]
    listBlockLeagueTable: { id: string | number; league: string }[]
  }

  const [showAlertMsg, setShowAlertMsg] = useState(false)

  const handleOK = () => {
    setShowAlertMsg(false)
    setEnableEditLeagueFilter()
  }

  return (
    <div className="px-4 pt-1 text-sm">
      <p className="mb-2 text-[#94979C]">
        Default league name matching will be [Partial], add &apos;%&apos; prefix for [Fully]
        matching, eg:
      </p>
      <p className="mb-2 text-[#94979C]">
        1) &apos;germany bundesliga&apos; will match &apos;Germany Bundesliga&apos;, &apos;Germany
        Bundesliga 1&apos;, &apos;Germany Bundesliga 2&apos;
      </p>
      <p className="text-[#94979C]">
        2) &apos;%germany bundesliga&apos; will only match &apos;Germany Bundesliga&apos;
      </p>
      <div className="text-end px-2 pt-6 pb-4 flex justify-between">
        {filterType == 'Allow' && listAllowLeagueTable.length < 1 && allowMajorLeague == 0 ? (
          <div className="text-red-color font-bold ">All League are BLOCKED !</div>
        ) : (
          <div></div>
        )}

        <NotificationSave
          title="Message"
          messageError="League Filter Saved!"
          showAlertDialog={showAlertMsg}
          setShowAlertDialog={setShowAlertMsg}
          handleOK={handleOK}
          ReactElement={<InformationCircle className="text-blue-500  mr-1" />}
        />
      </div>
    </div>
  )
}
export default React.memo(FooterLeagueFilter)
