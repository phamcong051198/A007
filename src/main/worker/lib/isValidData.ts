import { DataCrawlType } from '@shared/common/types'

export function isValidData(data: DataCrawlType): boolean {
  if (!data?.league || !data?.home || !data?.away) return false

  return true
}
