import { getResultBet_3in1Bet } from '@/worker/platform/3In1bet/actions/getResultBet'
import { getResultBet_P88 } from '@/worker/platform/P88/actions/getResultBet'
import { getResultBet_Viva88 } from '@/worker/platform/Viva88/actions/getResultBet'
import { getResultBet_WBet } from '@/worker/platform/Wbet/actions/getResultBet'
import { Account, SuccessList } from '@db/model'
import { AccountType, WaitingSuccessContraDBType } from '@shared/common/types'
import { parentPort } from 'worker_threads'

const port = parentPort
if (!port) throw new Error('IllegalState')

//300 = 5 phut x 60
const numberDelay = 300

// 60 = 1 phút x 60 giây
// const numberDelay = 50

setInterval(() => getResultBetRoot(), numberDelay * 1000)

const getResultBetRoot = async () => {
  const successList = SuccessList.findAll({}) as WaitingSuccessContraDBType[]
  if (!successList.length) return

  const listAccount = Account.findAll({ status: 'Logout', statusDelete: 0 }) as AccountType[]
  if (!listAccount.length) return

  for (const account of listAccount) {
    if (account.platformName == 'P88Bet') {
      await getResultBet_P88(account, successList)
    }

    if (account.platformName == 'Viva88Bet') {
      await getResultBet_Viva88(account, successList)
    }

    if (account.platformName == '3in1Bet') {
      await getResultBet_3in1Bet(account, successList)
    }

    if (account.platformName == 'WBet') {
      await getResultBet_WBet(account, successList)
    }
  }
}
