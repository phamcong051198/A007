export const API_BASE_URL = 'https://www.p88.bet'

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/member-service/v2/authenticate?locale=en_US&_=${Date.now()}&withCredentials=true`,
  BALANCE: `${API_BASE_URL}/member-service/v2/account-balance?locale=en_US&_=${Date.now()}&withCredentials=true`,
  RESULT_BET: `${API_BASE_URL}/member-service/v2/wager-filter?locale=en_US`
}

export const gameTypeMapP88: { [key: string]: number } = {
  Early: 0,
  Today: 1,
  Running: 2
}

export const ODD_CODE = {
  FT: {
    HDP: {
      HOME: '0|2|0|1',
      AWAY: '0|2|1|1',
      '0HOME': '0|2|0|0',
      '0AWAY': '0|2|1|0'
    },
    POINT: {
      OVER: '0|3|3|1',
      UNDER: '0|3|4|1',
      '0OVER': '0|3|3|0',
      '0UNDER': '0|3|4|0'
    }
  },
  FH: {
    HDP: {
      HOME: '1|2|0|1',
      AWAY: '1|2|1|1',
      '0HOME': '1|2|0|0',
      '0AWAY': '1|2|1|0'
    },
    POINT: {
      OVER: '1|3|3|1',
      UNDER: '1|3|4|1',
      '0OVER': '1|3|3|0',
      '0UNDER': '1|3|4|0'
    }
  }
}

export const buildHeadersP88Bet = (account: { customIP?: string | null }) => ({
  'Accept-Language':
    'en-US,en;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6,ja;q=0.5,cs;q=0.4,zh-TW;q=0.3,ms;q=0.2',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: 'https://www.p88.bet/en/sports',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Content-Type': 'application/json; charset=utf-8',
  ...(account?.customIP ? { 'X-Forwarded-For': account.customIP } : {})
})

export const buildHeadersLogin = (account: { customIP?: string | null }) => ({
  accept: 'application/json, text/plain, */*',
  'accept-language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7',
  'content-type': 'application/x-www-form-urlencoded',
  origin: 'https://www.p88.bet',
  referer: 'https://www.p88.bet/en/sports/soccer',
  'sec-ch-ua': `"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"`,
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': `"Windows"`,
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'trust-code': '',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
  'x-app-data':
    'z2F1H=mAIrHp7p;pctag=3877f697-88f4-4b3d-a04c-140d8b0670b4;directusToken=TwEdnphtyxsfMpXoJkCkWaPsL2KJJ3lo',
  'x-trust-client': 'false',
  ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
})
