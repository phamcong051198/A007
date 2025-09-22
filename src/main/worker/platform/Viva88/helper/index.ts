import { AccountType } from '@shared/common/types'

export const configHeaders = (accountInfo: AccountType) => ({
  Referer: `${accountInfo.host}/sports`,
  'Accept-Language': 'en-US,en;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6,ja;q=0.5,cs;q=0.4,zh-TW;q=0.3',
  'Accept-Encoding': 'gzip, deflate, br',
  Username: accountInfo.loginID,
  Devicetype: '1',
  Uid: accountInfo.loginID,
  Origin: accountInfo.host,
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Cookie: accountInfo.cookie,
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  ...(accountInfo.customIP ? { 'X-Forwarded-For': accountInfo.customIP } : {})
})
