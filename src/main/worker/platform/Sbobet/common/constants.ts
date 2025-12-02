export const SBO_CONFIG_TYPE_ODD = {
  FH_Handicap: 7,
  FH_OverUnder: 9,
  Handicap: 1,
  OverUnder: 3
}

export const SBO_CONFIG = {
  FETCH_EVENT: 'https://price-asi-r02.speedysurfcdn.net/api',
  FETCH_TOKEN: 'api/oddsApi/getTokens',
  FILTER_OF_VARIABLE: [
    {
      date: 'Today',
      presetFilter: 'All'
    },
    {
      date: 'Plus1',
      presetFilter: 'NonLive'
    },
    {
      date: 'Plus2',
      presetFilter: 'NonLive'
    },
    {
      date: 'Plus3',
      presetFilter: 'NonLive'
    },
    {
      date: 'Plus4',
      presetFilter: 'NonLive'
    },
    {
      date: 'Plus5',
      presetFilter: 'NonLive'
    },
    {
      date: 'Plus6',
      presetFilter: 'NonLive'
    },
    {
      date: 'Plus6Over',
      presetFilter: 'NonLive'
    },
    {
      date: 'EarlyMarket',
      presetFilter: 'NonLive'
    }
  ],
  MARKET_GROUP_IDS: [0, 306, 307, 308, 309, 310, 311, 312, 313, 330, 331],
  SHA256_HASH: '0576c8c29422ff37868b131240f644d4cfedb1be2151afbc1c57dbcb997fe9cb',
  SHA256_HASH_ODDS: '2c6e1227b7089e756f66a8750cd8c6c087ad4b39792388e35e2b0374b913fec0',
  SHA256_HASH_QUERY: 'f74a72f3ca60f047093e6b79d76adfe890bb20f44fe243250bdbf767cca22858',
  SITE_URL: 'https://www.sbobet.com'
}

export interface AccountBalanceResponse {
  generalBalance: BalanceInfo
  classicGamesBalance: BalanceInfo & {
    incompleteGame: boolean
  }
  isEnableClassicGamesBalance: boolean
}

interface BalanceInfo {
  cashBalance: number
  outstanding: number
  givenCredit: number
  betCredit: number
}
