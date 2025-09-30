import { DataCrawlType } from '@shared/common/types'

export function findMatchingData(
  list: DataCrawlType[],
  home: string,
  away: string
): DataCrawlType | undefined {
  if (!list?.length || !home || !away) return undefined

  const normalize = (str: string | null) =>
    str ? str.toLowerCase().replace(/\s+/g, ' ').trim() : ''

  const nHome = normalize(home)
  const nAway = normalize(away)

  // dùng trực tiếp list, nhưng so sánh với normalize
  // 1. Exact match
  let matchedItem = list.find(
    (item) => normalize(item.home) === nHome && normalize(item.away) === nAway
  )
  if (matchedItem) return matchedItem

  // 2. Home exact, away includes
  matchedItem = list.find(
    (item) =>
      normalize(item.home) === nHome &&
      (normalize(item.away).includes(nAway) || nAway.includes(normalize(item.away)))
  )
  if (matchedItem) return matchedItem

  // 3. Away exact, home includes
  matchedItem = list.find(
    (item) =>
      normalize(item.away) === nAway &&
      (normalize(item.home).includes(nHome) || nHome.includes(normalize(item.home)))
  )
  if (matchedItem) return matchedItem

  // 4. Both partial includes
  matchedItem = list.find(
    (item) =>
      (normalize(item.home).includes(nHome) || nHome.includes(normalize(item.home))) &&
      (normalize(item.away).includes(nAway) || nAway.includes(normalize(item.away)))
  )
  if (matchedItem) return matchedItem

  return undefined
}
