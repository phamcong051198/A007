/* eslint-disable @typescript-eslint/no-explicit-any */
import { systemLogToFile } from '@/worker/lib/systemLogToFile'
import db from '@db/config/database'
import Model, { Account, clearTable, NameLeague, Platform, SportsBook } from '@db/model'
import { PlatformType } from '@shared/common/types'

export const fetchDataSystem = async (
  url: string,
  model: Model,
  mapFn: any,
  accessToken: string
) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!response.ok) {
    await systemLogToFile(`Get ${url}: ${JSON.stringify(response.statusText)}`, 'Error')
    console.error(`Error fetching ${url}:`, response.statusText)
    return
  }

  const responseData = (await response.json()) as { data: { rows: any[] } }
  await systemLogToFile(`Get ${new URL(url).pathname}: Response 200 OK`, 'Program')

  const { rows } = responseData.data

  const transaction = db.transaction(() => {
    if (model === Platform) {
      const existingRecords = Platform.findAll() as PlatformType[]
      const platformNamesFromApi = new Set(
        rows.map(
          (platform: { id: string; platformName: string; url: string }) => platform.platformName
        )
      )

      for (const platform of rows) {
        const existingRecord = Platform.findOne({ uuid: platform.id })

        if (!existingRecord) {
          Platform.create({
            uuid: platform.id,
            name: platform.platformName,
            url: platform.url
          })
        }
      }
      for (const record of existingRecords) {
        if (!platformNamesFromApi.has(record.name)) {
          Platform.delete({ name: record.name })
          Account.deleteMany({ platformName: record.name })
          SportsBook.deleteMany({ platform: record.name })
        }
      }
    } else {
      if (model === NameLeague) {
        clearTable('NameLeague')
      } else {
        clearTable('NameTeam')
      }

      let insertStmt
      if (model === NameLeague) {
        insertStmt = db.prepare(`
            INSERT INTO NameLeague (nameLeague, platform, idPlatform, league)
            VALUES (?, ?, ?, ?)
          `)
      } else {
        insertStmt = db.prepare(`
            INSERT INTO NameTeam (nameTeam, nameLeague, platform, idPlatform, team, league)
            VALUES (?, ?, ?, ?, ?, ?)
          `)
      }

      const batchSize = 1000
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        for (const item of batch) {
          const mappedData = mapFn(item)
          if (mappedData !== null) {
            if (model === NameLeague) {
              insertStmt.run(
                mappedData.data.nameLeague,
                mappedData.data.platform,
                mappedData.data.idPlatform,
                mappedData.data.league
              )
            } else {
              insertStmt.run(
                mappedData.data.nameTeam,
                mappedData.data.nameLeague,
                mappedData.data.platform,
                mappedData.data.idPlatform,
                mappedData.data.team,
                mappedData.data.league
              )
            }
          }
        }
      }
    }
  })
  transaction()
}
