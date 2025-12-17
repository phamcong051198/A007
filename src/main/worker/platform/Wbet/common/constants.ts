import { TYPE_ODD } from '@shared/main/constants'

export const API_BASE_URL = 'https://app.true88.com'
export const ODDS_BASE_URL = 'https://odds.true88.com'

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/userlogin`,
  BALANCE: `${API_BASE_URL}/userbalance`,
  BET_CHECK: `${API_BASE_URL}/bet/betcheck`,
  BET_SINGLE: `${API_BASE_URL}/bet/betsingle`,
  UX_MARKET: `${ODDS_BASE_URL}/uxmarket`,
  UX_MATCH: `${ODDS_BASE_URL}/uxmatch`
}

export const PARAM_UX_MATCH = {
  Early: 'early',
  Running: 'live',
  Today: 'today'
}

export const KEY_UX_MATCH = {
  Early: '1',
  Running: '3',
  Today: '2'
}

export const KEY_UX_MATCH_ODDS = {
  HDP: 'hdp',
  OU: 'ou'
}

export const ARGUMENTS_UX_MATCH = {
  Early: ['en', 'hdp|ou', '1'],
  Running: ['en', 'hdp|ou', '3'],
  Today: ['en', 'hdp|ou', '2']
}

export const ARGUMENTS_UX_MARKET = {
  Early: ['en', '1', '1', '1', 'hdpou', '0', ''],
  Running: ['en', '1', '3|3', '1', 'hdpou', '0', ''],
  Today: ['en', '1', '2|3', '1', 'hdpou', '0', '']
}

export const TYPE_ODD_HDP = {
  HDP: 0,
  HDPH: 1
}
export const TYPE_ODD_OU = {
  OU: 0,
  OUH: 1
}

export const REVERSE_CONVERT_ODDS = {
  '0': '0',
  '0-0.5': '0.25',
  '0.5': '0.5',
  '0.5-1': '0.75',
  '1': '1',
  '1-1.5': '1.25',
  '1.5': '1.5',
  '1.5-2': '1.75',
  '10': '10',
  '10-10.5': '10.25',
  '10.5': '10.5',
  '10.5-11': '10.75',
  '11': '11',
  '11-11.5': '11.25',
  '11.5': '11.5',
  '11.5-12': '11.75',
  '12': '12',
  '12-12.5': '12.25',
  '12.5': '12.5',
  '12.5-13': '12.75',
  '13': '13',
  '13-13.5': '13.25',
  '13.5': '13.5',
  '13.5-14': '13.75',
  '14': '14',
  '14-14.5': '14.25',
  '14.5': '14.5',
  '14.5-15': '14.75',
  '15': '15',
  '15-15.5': '15.25',
  '15.5': '15.5',
  '15.5-16': '15.75',
  '16': '16',
  '16-16.5': '16.25',
  '16.5': '16.5',
  '16.5-17': '16.75',
  '17': '17',
  '17-17.5': '17.25',
  '17.5': '17.5',
  '17.5-18': '17.75',
  '18': '18',
  '18-18.5': '18.25',
  '18.5': '18.5',
  '18.5-19': '18.75',
  '19': '19',
  '19-19.5': '19.25',
  '19.5': '19.5',
  '19.5-20': '19.75',
  '2': '2',
  '2-2.5': '2.25',
  '2.5': '2.5',
  '2.5-3': '2.75',
  '20': '20',
  '20-20.5': '20.25',
  '20.5': '20.5',
  '20.5-21': '20.75',
  '21': '21',
  '21-21.5': '21.25',
  '21.5': '21.5',
  '21.5-22': '21.75',
  '22': '22',
  '3': '3',
  '3-3.5': '3.25',
  '3.5': '3.5',
  '3.5-4': '3.75',
  '4': '4',
  '4-4.5': '4.25',
  '4.5': '4.5',
  '4.5-5': '4.75',
  '5': '5',
  '5-5.5': '5.25',
  '5.5': '5.5',
  '5.5-6': '5.75',
  '6': '6',
  '6-6.5': '6.25',
  '6.5': '6.5',
  '6.5-7': '6.75',
  '7': '7',
  '7-7.5': '7.25',
  '7.5': '7.5',
  '7.5-8': '7.75',
  '8': '8',
  '8-8.5': '8.25',
  '8.5': '8.5',
  '8.5-9': '8.75',
  '9': '9',
  '9-9.5': '9.25',
  '9.5': '9.5',
  '9.5-10': '9.75'
}

export const HEADERS = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7',
  'content-type': 'application/json;charset=UTF-8',
  origin: 'https://true88.com',
  priority: 'u=1, i',
  referer: 'https://true88.com/',
  'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
}

export const BET_TYPE_MAP = {
  [TYPE_ODD.HDP]: ['HDP', 'HDPH'],
  [TYPE_ODD.OU]: ['OU', 'OUH']
}

export const ODDS_COL_MAP = {
  [TYPE_ODD.HDP]: { away: 4, home: 5 },
  [TYPE_ODD.OU]: { away: 6, home: 7 }
}
