import crypto from 'crypto'
import { setTimeout as delay } from 'timers/promises'
import { setTimeout } from 'timers/promises'
import { parentPort } from 'worker_threads'

import { Account, clearTable, Setting } from '@db/model'
import { HttpsProxyAgent } from 'https-proxy-agent'
import WebSocket from 'ws'

import { AccountType, SettingType } from '@shared/common/types'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isAccountActive } from '@/worker/lib/checkAccount'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { getBalanceViva88bet } from '@/worker/platform/Viva88/actions/getBalance'
import { gameTypeMapViva88 } from '@/worker/platform/Viva88/common/constants'

let pingIntervalId: NodeJS.Timeout | null = null
const pingInterval = 8000
let ws: WebSocket
let gameType: string | null = null

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', (accountInfo: AccountType) => {
  startTimer(accountInfo)
  handleCrawlData(accountInfo)
})

const handleCrawlData = async (accountInfo: AccountType) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const settings = Setting.findAll() as SettingType[]
    if (!settings.length) {
      await setTimeout(1000)
      continue
    }

    gameType = settings[0].gameType
    if (!gameType || gameType == 'None') {
      await setTimeout(1000)
      continue
    }

    const checkAccount = Account.findOne({
      id: accountInfo.id,
      status: 'Logout',
      statusDelete: 0,
      statusLogin: 'Success'
    }) as AccountType

    if (!checkAccount) process.exit(0)

    if (checkAccount.typeCrawl !== gameType) {
      await accountLogToFile(
        checkAccount.platformName,
        checkAccount.loginID,
        `GameType changed, refresh to sync.`,
        'Program'
      )

      isAccountActive(checkAccount.id) &&
        port?.postMessage({
          data: Account.update(
            { id: checkAccount.id },
            {
              status: 'Exit',
              textLog: 'GameType changed, check box refresh to sync.'
            }
          ),
          type: 'DataUpdateAccount'
        })
      await setTimeout(1000)
      continue
    }
    initializeWebSocket(checkAccount)
    return
  }
}

async function initializeWebSocket(account: AccountType) {
  if (ws) {
    ws.terminate()
    await setTimeout(2000)
  }

  const socketUrl = account.socketUrl
  const { searchParams } = new URL(socketUrl)
  const gid = searchParams.get('gid')
  const token = searchParams.get('token')
  const id = searchParams.get('id')
  const rid = searchParams.get('rid')

  const { status, data } = isProxyConfigValid(account)
  const { newIpAddress, newPort, newUsername, newPassword } = data

  const proxyUrl =
    status && account.proxyScope !== 'None'
      ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
      : undefined
  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  ws = new WebSocket(socketUrl, {
    agent: proxyAgent,
    headers: {
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8,vi;q=0.7',
      'Cache-Control': 'no-cache',
      Connection: 'Upgrade',
      Host: 'agnj3.viva88.net',
      Origin: 'https://d.viva88.net',
      Pragma: 'no-cache',
      'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
      'Sec-WebSocket-Key': `${crypto.randomBytes(16).toString('base64')}`,
      'Sec-WebSocket-Version': 13,
      Upgrade: 'websocket',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
    }
  })

  ws.on('open', () => {
    if (pingIntervalId) {
      clearInterval(pingIntervalId)
    }
    pingIntervalId = setInterval(() => sendPing(account), 7000)

    const init =
      42 +
      JSON.stringify([
        'init',
        {
          gid,
          id,
          rid,
          token,
          v: 2
        }
      ])

    ws.send(init)

    const marketid: string = gameTypeMapViva88[account.typeCrawl] //(E-early;T-today;L-live)
    const sub =
      42 +
      JSON.stringify([
        'subscribe',
        [
          [
            'odds',
            [
              {
                condition: {
                  bettype: [1, 3, 7, 8],
                  marketid,
                  no_stream: true,
                  sporttype: 1
                },
                id: 'c3',
                rev: null,
                sorting: 't'
              }
            ]
          ]
        ]
      ])

    ws.send(sub)
  })

  ws.on('message', async (message) => {
    if (!isAccountActive(account.id)) {
      ws?.close()
      process.exit(0)
    }

    const data = message.toString()
    // console.log(`Data Viva crawl: ${data}`)
    let dataLength = 0
    if (data.startsWith('42')) {
      if (data.includes('disconnectReason')) {
        await accountLogToFile(
          account.platformName,
          account.loginID,
          `Logged Again : ${data}`,
          'Program'
        )
        const dataAccount = Account.findOne({
          id: account.id,
          status: 'Logout',
          statusDelete: 0,
          statusLogin: 'Success'
        }) as AccountType
        if (!dataAccount) {
          ws?.close()
          process.exit(0)
        }
        if (dataAccount.checkBoxAutoLogin == 1) {
          port?.postMessage({
            data: Account.update(
              { id: account.id },
              {
                cookie: null,
                credit: '0',
                host: null,
                socketUrl: null,
                statusLogin: 'Fail',
                textLog: 'Logged Again ...'
              }
            ),
            type: 'LoggedAgain'
          })
        } else {
          port?.postMessage({
            data: Account.update(
              { id: account.id },
              {
                status: 'Exit',
                statusLogin: 'Fail',
                textLog: String(data)
              }
            ),
            type: 'DataUpdateAccount'
          })
        }
        ws?.close()
        process.exit(0)
      }
      if (data.includes('42["err","A002"]')) {
        await accountLogToFile(
          account.platformName,
          account.loginID,
          `Login Status:(ERROR)-Failed to connect to Socket.(${data})`,
          'Program'
        )
        const dataAccount = Account.findOne({
          id: account.id,
          status: 'Logout',
          statusDelete: 0,
          statusLogin: 'Success'
        }) as AccountType
        if (!dataAccount) {
          ws?.close()
          process.exit(0)
        }

        port?.postMessage({
          data: Account.update(
            { id: account.id },
            {
              checkBoxAutoLogin: 0,
              status: 'Exit',
              statusLogin: 'Fail',
              textLog: `Login Status: (ERROR) - Failed to connect Socket.Try another account!`
            }
          ),
          type: 'DataUpdateAccount'
        })

        ws?.close()
        process.exit(0)
      }
      const [type, message, content] = JSON.parse(data.substring(2))
      if (type === 'm' && message && content) {
        dataLength = content.length
      }
      isAccountActive(account.id) &&
        port?.postMessage({
          data: Account.update(
            { id: account.id },
            {
              status: 'Logout',
              statusLogin: 'Success',
              textLog: `Data Received: ${dataLength} / Soccer ${gameType}`
            }
          ),
          type: 'DataUpdateAccount'
        })

      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Data Received: ${dataLength} / Soccer ${gameType}`,
        'Program'
      )
      const settingInfo = Setting.findAll() as SettingType[]
      if (settingInfo[0].gameType === gameType) {
        isAccountActive(account.id) &&
          port?.postMessage({
            data,
            type: 'DataViva88'
          })
      }
    }
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })

  ws.on('close', async () => {
    const checkAccount = Account.findOne({
      id: account.id,
      status: 'Logout',
      statusDelete: 0,
      statusLogin: 'Success'
    }) as AccountType

    if (!checkAccount) process.exit(0)

    await accountLogToFile(
      checkAccount.platformName,
      checkAccount.loginID,
      `WebSocket connection closed. WebSocket.CLOSED [${gameType}]`,
      'Program'
    )

    if (pingInterval) {
      clearInterval(pingInterval)
      pingIntervalId = null
    }
    await setTimeout(2000)
    handleCrawlData(checkAccount)
    return
  })
}

async function sendPing(account: AccountType) {
  const { ErrorCode, Data } = await getBalanceViva88bet(account)

  if (ErrorCode == 106 || ErrorCode == -1 || ErrorCode == 210) {
    await accountLogToFile(account.platformName, account.loginID, `${Data}`, 'Program')

    const dataAccount = Account.findOne({
      id: account.id,
      status: 'Logout',
      statusDelete: 0,
      statusLogin: 'Success'
    }) as AccountType
    if (!dataAccount) {
      ws.close()
      process.exit(0)
    }
    if (ErrorCode == 210) {
      port?.postMessage({
        data: Account.update(
          { id: account.id },
          {
            status: 'Exit',
            statusLogin: 'Fail',
            textLog: Data
          }
        ),
        type: 'DataUpdateAccount'
      })
    } else if (dataAccount.checkBoxAutoLogin == 1) {
      port?.postMessage({
        data: Account.update(
          { id: account.id },
          {
            cookie: null,
            credit: '0',
            host: null,
            socketUrl: null,
            statusLogin: 'Fail',
            textLog: 'Logged Again ...'
          }
        ),
        type: 'LoggedAgain'
      })
    } else {
      port?.postMessage({
        data: Account.update(
          { id: account.id },
          {
            status: 'Exit',
            statusLogin: 'Fail',
            textLog: Data
          }
        ),
        type: 'DataUpdateAccount'
      })
    }
    ws.close()
    process.exit(0)
  }

  const checkAccount = Account.findOne({
    id: account.id,
    status: 'Logout',
    statusDelete: 0,
    statusLogin: 'Success'
  }) as AccountType

  if (!checkAccount) {
    ws.close()
    process.exit(0)
  }

  const settingInfo = Setting.findAll() as SettingType[]
  if (gameType !== settingInfo[0].gameType || checkAccount.typeCrawl !== gameType) {
    if (pingIntervalId) {
      clearInterval(pingIntervalId)
    }
    clearTable('Viva88Bet')
    ws.close()

    return
  }

  isAccountActive(account.id) &&
    port?.postMessage({
      data: Account.update({ id: account.id }, { credit: Data }),
      type: 'DataUpdateAccount'
    })

  if (ws.readyState === WebSocket.OPEN) {
    ws.send('2')
    //console.log(`${logTime()} Ping`)
  }
}

async function startTimer(account: AccountType) {
  const min = 2 * 60 // 120 phút
  const max = 3 * 60 // 180 phút

  // random integer từ 120 đến 180 (bao gồm cả 180)
  const randomMinutes = Math.floor(Math.random() * (max - min + 1)) + min
  const ms = randomMinutes * 60 * 1000

  console.log(`Timer started, se log sau ${randomMinutes} minute`)
  await delay(ms)

  port?.postMessage({
    data: Account.update(
      { id: account.id },
      {
        cookie: null,
        credit: '0',
        host: null,
        socketUrl: null,
        statusLogin: 'Fail',
        textLog: 'Logged Again ...'
      }
    ),
    type: 'LoggedAgain'
  })
  process.exit(0)
}
