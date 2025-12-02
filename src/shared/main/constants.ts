export const DEFAULT_ACCOUNT_STATUS = {
  checkBoxAutoLogin: 0,
  checkBoxBet: 1,
  checkBoxRefresh: 1,
  cookie: null,
  credit: '0',
  host: null,
  socketUrl: null,
  status: 'Login',
  statusLogin: null,
  textLog: null
}

export const DEFAULT_SETTING = {
  credit: 20,
  enable: 0,

  gameType: 'Running',
  profitMax: '0.70',
  profitMin: '0.03'
}

export const DEFAULT_TEAM_NAME_LIMIT = {
  limitMethod: 'TeamName',
  limitType: 'TotalCount',
  totalAmount: '5000',
  totalCount: '2'
}

export const DEFAULT_SPORTS_BOOK_CONFIG = {
  VIPAccountLogout: 1,
  accountType: 'All',
  delayLoginSec_from: '50',
  delayLoginSec_to: '70',
  delayNormal: '3',
  delaySameGame: '5',
  switchAccountSetting: 'off',
  switchIntervalSettingMinutes: '60',
  switchIntervalSetting_from: '60',
  switchIntervalSetting_to: '100',
  valueRange: 0
}

export const PLATFORM = {
  '3IN1BET': '3in1Bet',
  ISN88BET: 'Isn88Bet',
  P88BET: 'P88Bet',
  SBOBET: 'Sbobet',
  VIVA88BET: 'Viva88Bet',
  WBET: 'WBet'
}

export const TYPE_ODD = {
  HDP: 'HDP',
  OU: 'OU'
}

export const STATUS_ACCOUNT = {
  EXIT: 'Exit',
  INPROGRESS: 'InProgress',
  LOGIN: 'Login',
  LOGOUT: 'Logout'
}

export const STATUS_LOGIN = {
  FAIL: 'Fail',
  SUCCESS: 'Success'
}

export const OPTIONS_PROXY = {
  FULL: 'Full',
  NONE: 'None',
  ONLY_LOGIN: 'OnlyLogin'
}

export const TYPE_ODD_DETAIL = {
  HDP: 'SPREAD',
  OU: 'TOTAL'
}

export const PLATFORM_DATA = [
  {
    name: '3in1Bet',
    url: 'https://www.8611357.com/',
    uuid: 'f7a57136-fc82-4538-903d-a1d39b3f9623'
  },
  {
    name: 'P88Bet',
    url: 'https://www.p88.bet/',
    uuid: 'd4990a1a-c8ae-41d2-bd54-851967141d6b'
  },
  {
    name: 'Viva88Bet',
    url: 'https://www.viva88.net/',
    uuid: 'dc0077f9-5cc8-4ad1-9c02-7a4fc89b7e89'
  },
  {
    name: 'WBet',
    url: 'https://true88.com/',
    uuid: '197f36e1-71d1-4a7b-9c2c-3fd90269287f'
  }
]
