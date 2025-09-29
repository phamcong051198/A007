export function createPayload(gameType) {
  const fcMap = {
    Early: '6',
    Today: '1',
    Running: '4'
  }

  return {
    fc: fcMap[gameType],
    m_accType: 'MY+MR',
    SystemLanguage: 'en-US',
    TimeFilter: '0',
    m_gameType: 'S_',
    m_SortByTime: '0',
    m_LeagueList: '',
    SingleDouble: 'double',
    clientTime: '',
    c: 'A',
    fav: '',
    exlist: '0',
    keywords: '',
    m_sp: '0'
  }
}

export function isArError(res: unknown): res is { Au: number } {
  return typeof res === 'object' && res !== null && 'Au' in res
}
