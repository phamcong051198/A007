import { createModel } from '@db/model'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { SPREAD } from '@shared/common/constants'
import { CONVERT_HDP } from '@shared/common/constants'
import { AccountType, DataCrawlType } from '@shared/common/types'
import { TicketInfoDataBetType } from '@shared/common/types'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { toPositiveNumber } from '@/worker/lib/toPositiveNumber'
import { toQueryString } from '@/worker/lib/toQueryString'
import { loginCheckin_Viva88Bet } from '@/worker/platform/Viva88/actions/loginCheckin'
import { TypeGetTickets_Viva88 } from '@/worker/platform/Viva88/common/types'
import { configHeaders } from '@/worker/platform/Viva88/helper'

export async function getTicket_Viva88Bet(accountInfo: AccountType, ticket: TicketInfoDataBetType) {
  if (!ticket.isBetAllowed) {
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      ticket.betRejectionReason,
      'BetList'
    )
    return {
      Data: null,
      ErrorCode: 400,
      HDP: ticket.HDP,
      Hdp_point: ticket.hdp_point,
      Message: 'No Bet By User',
      Odds: 0
    }
  }
  await accountLogToFile(accountInfo.platformName, accountInfo.loginID, '', 'BetList')
  await accountLogToFile(
    accountInfo.platformName,
    accountInfo.loginID,
    `------------------------------------------------------------------------------------------------------------------------------------------`,
    'BetList'
  )
  await accountLogToFile(
    accountInfo.platformName,
    accountInfo.loginID,
    `--------------------[[${`GameType ${ticket.gameType}`}] ${ticket.nameHome} -vs- ${ticket.nameAway}: Bet ${ticket.bet}, ${ticket.number == 0 ? 'FullTime' : '1StHalf'} ${ticket.type}@${ticket.bet.trim() == ticket.nameAway.trim() ? -Number(ticket.hdp_point) : ticket.hdp_point}, Odd: ${ticket.odd} ]--------------------`,
    'BetList'
  )
  await accountLogToFile(accountInfo.platformName, accountInfo.loginID, '', 'BetList')
  await accountLogToFile(
    accountInfo.platformName,
    accountInfo.loginID,
    `Getting Ticket Info: ${ticket.bet}, ${ticket.number == 0 ? 'FullTime' : '1StHalf'} ${ticket.type}@${ticket.bet.trim() == ticket.nameAway.trim() ? -Number(ticket.hdp_point) : ticket.hdp_point}, Odd: ${ticket.odd}`,
    'BetList'
  )
  const { ErrorCode, Data } = await loginCheckin_Viva88Bet(accountInfo)

  if (ErrorCode !== 0) {
    return {
      Data: null,
      ErrorCode: 1,
      HDP: ticket.HDP,
      Hdp_point: ticket.hdp_point,
      Message: Data,
      Odds: 0
    }
  }

  try {
    const { status, data } = isProxyConfigValid(accountInfo)
    const { newIpAddress, newPort, newUsername, newPassword } = data
    const proxyUrl =
      status && accountInfo.proxyScope !== 'None'
        ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    const urlGetTickets = `${accountInfo.host}/Betting/GetTickets`
    const {
      bet,
      nameHome,
      home_over,
      away_under,
      hdp_point,
      betType,
      altLineId,
      idEvent,
      nameAway
    } = ticket

    let odd: number, line: number, hdp1: number, hdp2: number

    if (ticket.typeOdd == SPREAD) {
      odd = bet === nameHome ? home_over : away_under
      line = bet === nameHome ? hdp_point : hdp_point * -1
      hdp1 = hdp_point > 0 ? 0 : hdp_point * -1
      hdp2 = hdp_point > 0 ? hdp_point : 0
    } else {
      odd = bet === 'Over' ? home_over : away_under
      line = hdp_point
      hdp1 = hdp_point
      hdp2 = 0
    }
    const itemList = [
      {
        AcceptBetterOdds: 'true',
        Ascore: '',
        Away: nameAway,
        Betteam: bet === 'Under' || bet === nameAway ? 'a' : 'h',
        Bettype: betType,
        ChoiceValue: bet + '',
        Gameid: '1',
        Hdp1: hdp1 + '',
        Hdp2: hdp2 + '',
        Home: nameHome,
        Hscore: '',
        IsInPlay: 'false',
        Line: line + '',
        MMR: '',
        Matchid: idEvent + '',
        Odds: odd + '',
        Oddsid: altLineId + '',
        ProgramID: '',
        RaceNum: '0',
        Runner: '0',
        SrcOddsInfo: '',
        Stake: '',
        Type: 'OU',
        isQuickBet: 'false',
        isTablet: 'false',
        parentMatchId: '0'
      }
    ]
    const additionalParams = {
      LicUserName: '',
      OddsType: '4',
      WebSkinType: '3',
      lastReq: `${Math.floor(Date.now() / 1000)}`
    }

    const bodyGetTickets = toQueryString(itemList, additionalParams)
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Body: ${bodyGetTickets}`,
      'BetList'
    )
    const urlBalance = `https://api.viva88.net/api/Customer/Balance`

    const [resBalance, resGetTickets] = await Promise.all([
      fetch(urlBalance, {
        headers: { ...configHeaders(accountInfo), Authorization: `bearer ${Data}` },
        method: 'POST',
        ...(proxyAgent && { agent: proxyAgent })
      }),
      fetch(urlGetTickets, {
        headers: { ...configHeaders(accountInfo), Authorization: `bearer ${Data}` },
        method: 'POST',
        ...(proxyAgent && { agent: proxyAgent }),
        body: bodyGetTickets
      })
    ])

    const resDataBalance = (await resBalance.json()) as {
      Data: {
        BCredit: string
      }
    }
    if (+resDataBalance.Data.BCredit < +ticket.betAmount_Standard) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Credit currently [${resDataBalance.Data.BCredit}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        'BetList'
      )

      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Credit currently [${resDataBalance.Data.BCredit}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        Odds: 0
      }
    }

    const dataGetTickets: TypeGetTickets_Viva88 = await resGetTickets.json()

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response GetTicket: ${JSON.stringify(dataGetTickets)}`,
      'BetList'
    )
    if (dataGetTickets.ErrorCode !== 0) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error GetTicket: ${JSON.stringify(dataGetTickets)}`,
        'BetList'
      )
      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: 'Error: Get Ticket Fail',
        Odds: 0
      }
    } else if (dataGetTickets.Data[0].Code == 6) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error GetTicket: ${JSON.stringify(dataGetTickets)}`,
        'BetList'
      )
      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: ${dataGetTickets.Data[0].Message} `,
        Odds: 0
      }
    } else if (
      dataGetTickets.Data[0].Code == 15 &&
      dataGetTickets.Data[0].isOddsChange == true &&
      dataGetTickets.Data[0].OddsStatus == 'suspend'
    ) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error GetTicket: ${JSON.stringify(dataGetTickets)}`,
        'BetList'
      )
      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Suspend the betting odds`,
        Odds: 0
      }
    } else if (dataGetTickets.Data[0].isLineChange == true) {
      const Viva88Bet = createModel('Viva88Bet', dataCrawlByPlatformSchema)

      const findTicket = Viva88Bet.findOne({
        altLineId: dataGetTickets.Data[0].OddsID
      }) as DataCrawlType

      if (findTicket) {
        const { id, ...updateData } = findTicket
        Viva88Bet.update(
          { id },
          {
            ...updateData,
            HDP: CONVERT_HDP[
              toPositiveNumber(
                dataGetTickets.Data[0].Line < 0
                  ? dataGetTickets.Data[0].Line * -1
                  : dataGetTickets.Data[0].Line
              )
            ],
            hdp_point: dataGetTickets.Data[0].Line
          }
        )
      }
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error GetTicket: Hdp/ou has been changed`,
        'BetList'
      )
      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Hdp/ou has been changed`,
        Odds: 0
      }
    }

    if (+ticket.betAmount_Standard < parseFloat(dataGetTickets.Data[0].Minbet.replace(/,/g, ''))) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${parseFloat(dataGetTickets.Data[0].Minbet.replace(/,/g, ''))}]`,
        'BetList'
      )

      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${parseFloat(dataGetTickets.Data[0].Minbet.replace(/,/g, ''))}]`,
        Odds: 0
      }
    }

    return {
      Data: { authorization: Data, dataGetTicketInfo: dataGetTickets.Data[0] },
      ErrorCode: 0,

      HDP: CONVERT_HDP[
        toPositiveNumber(
          dataGetTickets.Data[0].Line < 0
            ? dataGetTickets.Data[0].Line * -1
            : dataGetTickets.Data[0].Line
        )
      ],
      Hdp_point: ticket.hdp_point,
      Message:
        dataGetTickets.Data[0].Code == 15 && dataGetTickets.Data[0].isOddsChange == true
          ? 'ODDS_CHANGE'
          : 'OK',
      Odds: dataGetTickets.Data[0].SrcOdds
    }
  } catch (error) {
    console.log(
      'Fetch Viva88 GetTickets Fail',
      error instanceof Error ? error.message : String(error)
    )
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `GetTickets Fail: ${error instanceof Error ? error.message : String(error)}`,
      'BetList'
    )

    return {
      Data: null,
      ErrorCode: 1,
      HDP: ticket.HDP,
      Hdp_point: ticket.hdp_point,
      Message: `Error: Get Ticket Fail ${error instanceof Error ? error.message : 'Unknown Error'}`,
      Odds: 0
    }
  }
}
