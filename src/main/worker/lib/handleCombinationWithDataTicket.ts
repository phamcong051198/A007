import { formatTime } from '@/worker/lib/formatTime'
import { validateSettingAccountPairBeforeBet } from '@/worker/lib/validateSettingAccountPairBeforeBet'
import { AccountPairDBType } from '@db/schema/accountPair'
import { AccountSettingType } from '@shared/common/types'
import { DataPairPlatformType } from '@shared/common/types'

export const handleCombinationWithDataTicket = async (
  arrDataBet: { idAccountPair: string; dataPair: string }[][],
  dataTicket: DataPairPlatformType[],
  accountPair: AccountPairDBType,
  gameType: string,
  port
) => {
  const { account1: account1Data, account2: account2Data } = accountPair
  const parsedAccount1 = JSON.parse(account1Data) as AccountSettingType
  const parsedAccount2 = JSON.parse(account2Data) as AccountSettingType

  const resultValidate = await validateSettingAccountPairBeforeBet(
    parsedAccount1,
    parsedAccount2,
    dataTicket,
    port,
    gameType
  )
  if (!resultValidate.valid) return

  const { accounts, isTicketBetFlags } = resultValidate

  const dataTicketBet = [
    accounts.map((account, idx) => {
      const { info, setting, ticket } = account

      const company = `${info.platformName}-${info.loginID}`
      const coverage = ticket.number === 0 ? 'FT' : 'FirstHalf'

      let isBetAllowed = setting.generalSetting !== 'NoBet'
      let betRejectionReason = isBetAllowed ? '' : 'No Bet By User'

      if (setting.generalSetting === 'BetSelected') {
        const allow = isTicketBetFlags[idx] === 1
        isBetAllowed = allow
        betRejectionReason = allow ? '' : 'No Bet By User'
      }

      return {
        ...account.ticket,
        checkOdd: setting.checkOdd,
        oddFrom: setting.oddFrom,
        oddTo: setting.oddTo,
        checkContra: setting.contra,
        isBetAllowed,
        betRejectionReason,
        idAccount: account.info.id,
        betAmount_Standard: account.ticket.stake,
        company,
        coverage,
        gameType,
        time: formatTime(),
        info: '',
        receiptID: '',
        receiptStatus: ''
      }
    })
  ].map((pair) => ({
    idAccountPair: accountPair.id,
    dataPair: JSON.stringify(pair)
  }))

  arrDataBet.push(dataTicketBet)
}
