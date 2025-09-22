import { Account, SportsBook } from '@db/model'
import { AccountType, SportsBookType } from '@shared/common/types'

export function handleGetAccountBySportsBook(activeSportsBook: string) {
  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]

  const listAccount = Account.findAll() as AccountType[]
  const platforms = listPlatformBySportsBook.map((item) => item.platform)
  const result = listAccount.filter((item) => platforms.includes(item.platformName))

  return result
}
