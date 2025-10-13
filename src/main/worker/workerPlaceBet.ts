import { setTimeout } from 'timers/promises'
import { v4 as uuidv4 } from 'uuid'
import { MessagePort, parentPort } from 'worker_threads'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { handleBetTicket, handleGetTicket, handleReBetTicket } from '@/worker/lib/betService'
import { calculateProfit } from '@/worker/lib/calculateProfit'
import { checkAccountContinues } from '@/worker/lib/checkAccountContinues'
import { checkBetLimit } from '@/worker/lib/checkBetLimit'
import { checkClearData } from '@/worker/lib/checkClearData'
import { clearTablesForGameType } from '@/worker/lib/clearTablesForGameType'
import { findValidAccount } from '@/worker/lib/findValidAccount'
import { formatTime } from '@/worker/lib/formatTime'
import { handleOutOfCommission } from '@/worker/lib/handleOutOfCommission'
import { processTicketPair } from '@/worker/lib/processTicketPair'
import { saveOrUpdateBetRecordPerMatchDetail } from '@/worker/lib/saveOrUpdateBetRecord'
import { UpdatePerMatchLimit } from '@/worker/lib/updatePerMatchLimit'
import { UpsertTicketDelaySec } from '@/worker/lib/upsertTicketDelaySec'
import { validateSettingAccountPairBeforeBet } from '@/worker/lib/validateSettingAccountPairBeforeBet'
import {
  AccountPair,
  BetListResult,
  clearTable,
  ContraList,
  DataBet,
  Setting,
  SettingTableView,
  SuccessList,
  WaitingList
} from '@db/model'
import { AccountPairDBType } from '@db/schema/accountPair'
import {
  AccountSettingType,
  SettingTableViewType,
  TicketInfoDataBetType,
  WaitingSuccessContraDBType
} from '@shared/common/types'
import { AccountType, DataBetType, SettingType } from '@shared/common/types'

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async (action) => {
  if (action == 'Start') {
    await handleData(port)
  }
})

async function handleData(port: MessagePort) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const setting = Setting.findAll()[0] as SettingType
    if (setting.enable === 1) {
      await setTimeout(1000)
      continue
    }
    const listDataBet = DataBet.findAll(
      {},
      { orderBy: 'id', desc: true, limit: 50 }
    ) as DataBetType[]

    if (!listDataBet.length) {
      await setTimeout(1000)
      continue
    }

    for (const dataBet of listDataBet) {
      if (!dataBet.id) continue

      const ticketPairRoot = JSON.parse(dataBet.dataPair)
      const ticketPair = ticketPairRoot.map((ticket: TicketInfoDataBetType) => ({
        ...ticket,
        time: formatTime()
      })) as TicketInfoDataBetType[]

      const checkTimestampDelaySec = processTicketPair(ticketPair)
      if (!checkTimestampDelaySec) continue

      const [ticketI, ticketII] = ticketPair as TicketInfoDataBetType[]

      const account1 = findValidAccount(ticketI.idAccount)
      const account2 = findValidAccount(ticketII.idAccount)

      if (!account1 || !account2) continue

      //1.Check Settings General
      const settingInfo = Setting.findAll()[0] as SettingType

      if (settingInfo.gameType !== ticketI.gameType) {
        clearTablesForGameType()
        break
      }

      //2.Check Settings Account Pair
      const checkAccountPair = AccountPair.findOne({
        id: dataBet.idAccountPair
      }) as AccountPairDBType
      if (!checkAccountPair) continue

      const parsedAccount1 = JSON.parse(checkAccountPair.account1) as AccountSettingType
      const parsedAccount2 = JSON.parse(checkAccountPair.account2) as AccountSettingType

      const resultValidate = await validateSettingAccountPairBeforeBet(
        parsedAccount1,
        parsedAccount2,
        ticketPair,
        port,
        settingInfo.gameType
      )

      if (!resultValidate.valid) {
        console.log('Data resultValidate FAIL:', resultValidate)
        continue
      }

      const { accounts, isTicketBetFlags } = resultValidate

      const ticketPairChecked = accounts.map((account, idx) => {
        const { setting } = account

        let isBetAllowed = setting.generalSetting !== 'NoBet'
        let betRejectionReason = isBetAllowed ? '' : 'No Bet By User'

        if (setting.generalSetting === 'BetSelected') {
          const allow = isTicketBetFlags[idx] === 1
          isBetAllowed = allow
          betRejectionReason = allow ? '' : 'No Bet By User'
        }

        return {
          ...account.ticket,
          checkContra: setting.contra,
          isBetAllowed,
          betRejectionReason,
          betAmount_Standard: String(account.ticket.stake)
        }
      }) as TicketInfoDataBetType[]

      //-----------------------------------------------------------------------------------

      const dataAccounts = [account1, account2]

      const canPlaceBet = await checkBetLimit(ticketPair, dataAccounts, port)
      if (!canPlaceBet) continue

      await handlePlaceBet(ticketPairChecked)
      await setTimeout(2000)
    }

    clearTable('DataBet')
  }
}

const handlePlaceBet = async (ticketPair: TicketInfoDataBetType[]) => {
  for (const ticket of ticketPair) {
    ticket.info = 'In-progress'
  }

  const { uuid, dataPair } = WaitingList.create({
    uuid: uuidv4(),
    dataPair: JSON.stringify(ticketPair)
  }) as WaitingSuccessContraDBType

  port.postMessage({ type: 'WaitingListDone' })

  const [ticketI, ticketII]: TicketInfoDataBetType[] = JSON.parse(dataPair)

  const isCheckAccountContinues = checkAccountContinues(ticketPair)

  if (!isCheckAccountContinues) {
    clearTable('WaitingList')
    port.postMessage({ type: 'WaitingListDone' })
    return
  }

  const { accountInfoI, accountInfoII } = isCheckAccountContinues as {
    accountInfoI: AccountType
    accountInfoII: AccountType
  }

  const [
    {
      ErrorCode: ErrorCodeI,
      Message: MessageI,
      Hdp_point: Hdp_pointI,
      HDP: HDPI,
      Odds: OddsI,
      Data: DataI
    },
    {
      ErrorCode: ErrorCodeII,
      Message: MessageII,
      Hdp_point: Hdp_pointII,
      HDP: HDPII,
      Odds: OddsII,
      Data: DataII
    }
  ] = await Promise.all([
    handleGetTicket(ticketI, accountInfoI),
    handleGetTicket(ticketII, accountInfoII)
  ])

  WaitingList.delete({ uuid })
  port.postMessage({ type: 'WaitingListDone' })

  if (ErrorCodeI == 1 || ErrorCodeII == 1 || (ErrorCodeI == 400 && ErrorCodeII == 400)) {
    const ticketUpdate = [
      { ...ticketI, info: ErrorCodeI == 0 ? 'Ticket Received' : MessageI },
      { ...ticketII, info: ErrorCodeII == 0 ? 'Ticket Received' : MessageII }
    ]

    checkClearData()
    const recordDB = BetListResult.create({
      dataPair: JSON.stringify(ticketUpdate)
    })
    port.postMessage({ type: 'BetList', recordDB })
    return
  }

  const ticketIUpdate = { ...ticketI, info: MessageI, hdp_point: Hdp_pointI, HDP: HDPI }
  const ticketIIUpdate = { ...ticketII, info: MessageII, hdp_point: Hdp_pointII, HDP: HDPII }

  if (MessageI == 'ODDS_CHANGE' && (MessageII == 'OK' || ErrorCodeII == 400)) {
    const { status, profit } = calculateProfit(Number(OddsI), Number(ticketII.odd))
    if (status === 'Fail') {
      handleOutOfCommission(
        port,
        profit,
        ticketI,
        ticketII,
        OddsI,
        ticketII.odd,
        ticketI.odd,
        ticketII.odd
      )
      return
    }
    ticketIUpdate.odd = OddsI

    ticketIUpdate.profit = profit
    ticketIIUpdate.profit = profit
  } else if ((MessageI == 'OK' || ErrorCodeI == 400) && MessageII == 'ODDS_CHANGE') {
    const { status, profit } = calculateProfit(Number(ticketI.odd), Number(OddsII))
    if (status === 'Fail') {
      handleOutOfCommission(
        port,
        profit,
        ticketI,
        ticketII,
        ticketI.odd,
        OddsII,
        ticketI.odd,
        ticketII.odd
      )
      return
    }
    ticketIIUpdate.odd = OddsII

    ticketIUpdate.profit = profit
    ticketIIUpdate.profit = profit
  } else if (MessageI == 'ODDS_CHANGE' && MessageII == 'ODDS_CHANGE') {
    const { status, profit } = calculateProfit(Number(OddsI), Number(OddsII))
    if (status === 'Fail') {
      handleOutOfCommission(
        port,
        profit,
        ticketI,
        ticketII,
        OddsI,
        OddsII,
        ticketI.odd,
        ticketII.odd
      )
      return
    }
    ticketIUpdate.odd = OddsI
    ticketIIUpdate.odd = OddsII

    ticketIUpdate.profit = profit
    ticketIIUpdate.profit = profit
  }

  const [
    { ErrorCode: ErrorCodeBetI, Data: DataBetI },
    { ErrorCode: ErrorCodeBetII, Data: DataBetII }
  ] = await Promise.all([
    handleBetTicket(ticketIUpdate, accountInfoI, DataI),
    handleBetTicket(ticketIIUpdate, accountInfoII, DataII)
  ])

  const ticketUpdate = [
    { ...ticketIUpdate, ...DataBetI },
    { ...ticketIIUpdate, ...DataBetII }
  ]
  checkClearData()

  const isSuccess =
    (ErrorCodeBetI === 0 || ErrorCodeBetI === 400) &&
    (ErrorCodeBetII === 0 || ErrorCodeBetII === 400)
  if (isSuccess) {
    if (ErrorCodeBetI === 0) {
      UpdatePerMatchLimit(accountInfoI, ticketIUpdate)
      UpsertTicketDelaySec(ticketIUpdate)
    }
    if (ErrorCodeBetII === 0) {
      UpdatePerMatchLimit(accountInfoII, ticketIIUpdate)
      UpsertTicketDelaySec(ticketIIUpdate)
    }

    SuccessList.create({
      uuid,
      dataPair: JSON.stringify(ticketUpdate)
    }) as WaitingSuccessContraDBType
    const recordDB = BetListResult.create({
      dataPair: JSON.stringify(ticketUpdate)
    })
    port.postMessage({ type: 'SuccessList', recordDB })

    return
  }

  const isFail =
    ((ErrorCodeBetI === 1 || ErrorCodeBetI === 400) &&
      (ErrorCodeBetII === 1 || ErrorCodeBetII === 400)) ||
    (ErrorCodeBetI === 2 && ErrorCodeBetII === 2)
  if (isFail) {
    const recordDB = BetListResult.create({
      dataPair: JSON.stringify(ticketUpdate)
    })
    port.postMessage({ type: 'BetList', recordDB })
    return
  }

  const isErrorI = ErrorCodeBetI === 2
  const isErrorII = ErrorCodeBetII === 2

  if (isErrorI || isErrorII) {
    const [ticketFailed, ticketStable] = isErrorI
      ? [ticketI, ticketUpdate[1]]
      : [ticketII, ticketUpdate[0]]
    const [accountFailed, accountStable] = isErrorI
      ? [accountInfoI, accountInfoII]
      : [accountInfoII, accountInfoI]

    UpdatePerMatchLimit(accountStable, ticketStable)

    const settingTableView = SettingTableView.findOne({ tab: 'ContraList' }) as SettingTableViewType
    if (ticketFailed.checkContra === 0 || settingTableView.contraStrategy !== 'auto') {
      const recordDB = BetListResult.create({ dataPair: JSON.stringify(ticketUpdate) })

      ContraList.create({
        uuid,
        dataPair: JSON.stringify(ticketUpdate)
      }) as WaitingSuccessContraDBType
      port.postMessage({ type: 'ContraList', recordDB })
      return
    }

    await accountLogToFile(
      ticketFailed.platform,
      accountFailed.loginID,
      `# Handle Retry BetTicket: ${ticketFailed.bet}, ${ticketFailed.number == 0 ? 'FullTime' : '1StHalf'} ${ticketFailed.type}@${ticketFailed.bet.trim() == ticketFailed.nameAway.trim() ? -Number(ticketFailed.hdp_point) : ticketFailed.hdp_point}, Odd: ${ticketFailed.odd}`,
      'BetList'
    )

    const { ErrorCode, Data } = await handleReBetTicket(
      ticketFailed,
      accountFailed,
      ticketFailed.platform
    )

    const { info, receiptID, receiptStatus, odd } = Data
    const profit = Number((odd + ticketStable.odd).toFixed(3))

    const ticketUpdateNew = [
      {
        ...ticketUpdate[0],
        profit,
        ...(isErrorI ? { odd, info: info + '(ContraBet)', receiptID, receiptStatus } : {})
      },
      {
        ...ticketUpdate[1],
        profit,
        ...(isErrorII ? { odd, info: info + '(ContraBet)', receiptID, receiptStatus } : {})
      }
    ]

    checkClearData()
    const recordType = ErrorCode == 1 ? 'ContraList' : 'SuccessList'
    const recordDB = BetListResult.create({ dataPair: JSON.stringify(ticketUpdateNew) })

    if (recordType === 'ContraList') {
      ContraList.create({
        uuid,
        dataPair: JSON.stringify(ticketUpdateNew)
      }) as WaitingSuccessContraDBType
      if (isErrorI) {
        saveOrUpdateBetRecordPerMatchDetail(ticketUpdateNew[0])
      }
      if (isErrorII) {
        saveOrUpdateBetRecordPerMatchDetail(ticketUpdateNew[1])
      }
    } else {
      SuccessList.create({
        uuid,
        dataPair: JSON.stringify(ticketUpdateNew)
      }) as WaitingSuccessContraDBType
      UpdatePerMatchLimit(accountFailed, ticketFailed)
    }

    port.postMessage({ type: recordType, recordDB })
    return
  }
}
