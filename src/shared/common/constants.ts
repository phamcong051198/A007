export const CONVERT_HDP = {
  '10': '10',
  '10.25': '10-10.5',
  '10.5': '10.5',
  '10.75': '10.5-11',
  '11': '11',
  '11.25': '11-11.5',
  '11.5': '11.5',
  '11.75': '11.5-12',
  '12': '12',
  '12.25': '12-12.5',
  '12.5': '12.5',
  '12.75': '12.5-13',
  '13': '13',
  '13.25': '13-13.5',
  '13.5': '13.5',
  '13.75': '13.5-14',
  '14': '14',
  '14.25': '14-14.5',
  '14.5': '14.5',
  '14.75': '14.5-15',
  '15': '15',
  '15.25': '15-15.5',
  '15.5': '15.5',
  '1.5': '1.5',
  '15.75': '15.5-16',
  '1': '1',
  '16': '16',
  '0.5': '0.5',
  '16.25': '16-16.5',
  '0': '0',
  '16.5': '16.5',
  '0.25': '0-0.5',
  '16.75': '16.5-17',
  '0.75': '0.5-1',
  '17': '17',
  '1.25': '1-1.5',
  '17.25': '17-17.5',
  '1.75': '1.5-2',
  '17.5': '17.5',
  '17.75': '17.5-18',
  '18': '18',
  '18.25': '18-18.5',
  '18.5': '18.5',
  '18.75': '18.5-19',
  '19': '19',
  '19.25': '19-19.5',
  '19.5': '19.5',
  '19.75': '19.5-20',
  '2': '2',
  '2.25': '2-2.5',
  '2.5': '2.5',
  '2.75': '2.5-3',
  '20.25': '20-20.5',
  '20': '20',
  '20.75': '20.5-21',
  '20.5': '20.5',
  '21.25': '21-21.5',
  '21': '21',
  '21.75': '21.5-22',
  '21.5': '21.5',
  '22': '22',
  '3': '3',
  '3.25': '3-3.5',
  '3.5': '3.5',
  '3.75': '3.5-4',
  '4': '4',
  '4.25': '4-4.5',
  '4.5': '4.5',
  '4.75': '4.5-5',
  '5': '5',
  '5.25': '5-5.5',
  '5.5': '5.5',
  '5.75': '5.5-6',
  '6': '6',
  '6.25': '6-6.5',
  '6.5': '6.5',
  '6.75': '6.5-7',
  '7': '7',
  '7.25': '7-7.5',
  '7.5': '7.5',
  '7.75': '7.5-8',
  '8': '8',
  '8.25': '8-8.5',
  '8.5': '8.5',
  '8.75': '8.5-9',
  '9': '9',
  '9.25': '9-9.5',
  '9.5': '9.5',
  '9.75': '9.5-10'
}

export const ROW_SIZE = 3

export const GAME_TYPES = {
  EARLY: 'Early',
  NONE: 'None',
  RUNNING: 'Running',
  TODAY: 'Today'
}

export const SPREAD = 'SPREAD'
export const TOTAL = 'TOTAL'
export const OVER = 'Over'
export const UNDER = 'Under'

export const FT = 0
export const FH = 1

export const HDP_FT = 1
export const HDP_FH = 7
export const OU_FT = 3
export const OU_FH = 1

export const newDataTableEmpty = {
  HDP: '',

  altLineId: 0,

  away: '',
  away_under: 0,

  bet: '',
  betAmount_Standard: '',
  betRejectionReason: '',

  betType: 0,

  checkContra: 0,
  checkOdd: 0,
  company: '',
  coverage: '',
  gameType: '',
  hdp_point: 0,
  home: '',
  home_over: 0,
  id: 9999,
  idAccount: 0,
  idEvent: 0,
  idLeague: 0,
  info: '',
  isBetAllowed: false,
  isHomeStrong: 0,
  league: '',
  marketSelectionId_away_under: 0,
  marketSelectionId_home_over: 0,
  nameAway: '',
  nameHome: '',
  nameLeague: '',
  number: 0,
  odd: 0,
  oddFrom: '',
  oddTo: '',
  platform: '',

  profit: 0,
  receiptID: '',
  receiptStatus: '',
  redCard: '',

  score: '',
  specialOdd: 0,
  stake: 20,
  stat: '',
  submatch_id: 0,
  time: '',
  type: '',
  typeOdd: '',
  uuidLeague: ''
}

export const getThemeClass = (mode: 'bg' | 'text' | 'hover' = 'bg') => {
  const theme = 'blue'

  if (mode === 'bg') {
    if (theme === 'blue') return 'bg-[#155EEF]'
    if (theme === 'green') return 'bg-[#14B800]'
    if (theme === 'purple') return 'bg-[#7F56D9]'
  } else if (mode === 'hover') {
    if (theme === 'blue') return 'hover:bg-[#155EEF]'
    if (theme === 'green') return 'hover:bg-[#14B800]'
    if (theme === 'purple') return 'hover:bg-[#7F56D9]'
  } else {
    if (theme === 'blue') return 'text-[#155EEF]'
    if (theme === 'green') return 'text-[#14B800]'
    if (theme === 'purple') return 'text-[#7F56D9]'
  }

  return ''
}

export const LIMIT_METHOD = {
  NAME_BETTYPE_LIMIT: 'NameBetTypeLimit',
  NAME_TARGET_LIMIT: 'NameTargetLimit',
  TEAM_NAME: 'TeamName',
  TEAM_NAME_HANDICAP: 'TeamNameHandicap'
} as const

export const LIMIT_TYPE = {
  TOTAL_AMOUNT: 'TotalAmount',
  TOTAL_COUNT: 'TotalCount'
} as const
