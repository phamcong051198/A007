export const DEFAULT_ACCOUNT_STATUS = {
  status: 'Login',
  checkBoxBet: 1,
  checkBoxRefresh: 1,
  checkBoxAutoLogin: 0,
  statusLogin: null,
  credit: '0',
  textLog: null,
  host: null,
  cookie: null,
  socketUrl: null
}

export const DEFAULT_SETTING = {
  credit: 20,
  enable: 0,

  profitMin: '0.03',
  profitMax: '0.70',
  gameType: 'Running'
}

export const DEFAULT_TEAM_NAME_LIMIT = {
  limitMethod: 'TeamName',
  limitType: 'TotalCount',
  totalAmount: '5000',
  totalCount: '2'
}

export const DEFAULT_SPORTS_BOOK_CONFIG = {
  delayNormal: '3',
  delaySameGame: '5',
  delayLoginSec_from: '50',
  delayLoginSec_to: '70',
  switchIntervalSetting_from: '60',
  switchIntervalSettingMinutes: '60',
  switchIntervalSetting_to: '100',
  accountType: 'All',
  switchAccountSetting: 'off',
  VIPAccountLogout: 1,
  valueRange: 0
}

export const PLATFORM = {
  P88BET: 'P88Bet',
  VIVA88BET: 'Viva88Bet',
  SBOBET: 'Sbobet',
  ISN88BET: 'Isn88Bet',
  WBET: 'WBet',
  '3IN1BET': '3in1Bet'
}

export const TYPE_ODD = {
  HDP: 'HDP',
  OU: 'OU'
}

export const STATUS_ACCOUNT = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  EXIT: 'Exit',
  INPROGRESS: 'InProgress'
}

export const STATUS_LOGIN = {
  SUCCESS: 'Success',
  FAIL: 'Fail'
}

export const OPTIONS_PROXY = {
  NONE: 'None',
  FULL: 'Full',
  ONLY_LOGIN: 'OnlyLogin'
}

export const TYPE_ODD_DETAIL = {
  HDP: 'SPREAD',
  OU: 'TOTAL'
}

export const PLATFORM_DATA = [
  {
    uuid: 'f7a57136-fc82-4538-903d-a1d39b3f9623',
    name: '3in1Bet',
    url: 'https://www.8611357.com/'
  },
  {
    uuid: 'd4990a1a-c8ae-41d2-bd54-851967141d6b',
    name: 'P88Bet',
    url: 'https://www.p88.bet/'
  },
  {
    uuid: 'dc0077f9-5cc8-4ad1-9c02-7a4fc89b7e89',
    name: 'Viva88Bet',
    url: 'https://www.viva88.net/'
  },
  {
    uuid: '197f36e1-71d1-4a7b-9c2c-3fd90269287f',
    name: 'WBet',
    url: 'https://true88.com/'
  }
]
