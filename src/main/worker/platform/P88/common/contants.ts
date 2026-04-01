// export const API_BASE_URL = 'https://www.p88.bet'

// export const API_ENDPOINTS = {
//   AUTH: `${API_BASE_URL}/member-auth/v2/authenticate?locale=en_US&_=${Date.now()}&withCredentials=true`,
//   BALANCE: `${API_BASE_URL}/member-service/v2/account-balance?locale=en_US&_=${Date.now()}&withCredentials=true`,
//   KEEP_ALIVE: `${API_BASE_URL}/member-auth/v2/keep-alive?locale=en_US&_=${Date.now()}&withCredentials=true`,
//   MULTI_TICKET: `${API_BASE_URL}/member-betslip/v2/all-odds-selections?locale=en_US&_=${Date.now()}&withCredentials=true`
// }

export const gameTypeMapP88: { [key: string]: number } = {
  Early: 0,
  Running: 2,
  Today: 1
}

export const ODD_CODE = {
  FH: {
    HDP: {
      '0AWAY': '1|2|1|0',
      '0HOME': '1|2|0|0',
      AWAY: '1|2|1|1',
      HOME: '1|2|0|1'
    },
    POINT: {
      '0OVER': '1|3|3|0',
      '0UNDER': '1|3|4|0',
      OVER: '1|3|3|1',
      UNDER: '1|3|4|1'
    }
  },
  FT: {
    HDP: {
      '0AWAY': '0|2|1|0',
      '0HOME': '0|2|0|0',
      AWAY: '0|2|1|1',
      HOME: '0|2|0|1'
    },
    POINT: {
      '0OVER': '0|3|3|0',
      '0UNDER': '0|3|4|0',
      OVER: '0|3|3|1',
      UNDER: '0|3|4|1'
    }
  }
}

export const buildHeadersP88Bet = (
  account: { customIP?: string | null; loginURL: string },
  vHucode?: string
) => ({
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language':
    'en-US,en;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6,ja;q=0.5,cs;q=0.4,zh-TW;q=0.3,ms;q=0.2',
  'Content-Type': 'application/json; charset=utf-8',
  Referer: `${account.loginURL}en/sports`,
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
  ...(vHucode ? { 'v-hucode': vHucode } : {}),
  ...(account?.customIP ? { 'X-Forwarded-For': account.customIP } : {})
})

export const buildHeadersLogin = (account: { customIP?: string | null; loginURL: string }) => ({
  accept: 'application/json, text/plain, */*',
  'accept-language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7',
  'content-type': 'application/x-www-form-urlencoded',
  origin: account.loginURL,
  referer: `${account.loginURL}en/sports/soccer`,
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
