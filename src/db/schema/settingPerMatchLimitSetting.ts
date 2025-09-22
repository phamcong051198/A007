export type SettingPerMatchLimitType = {
  id: number
  namePlatform: string
  limitMethod: string
  limitType: string
  totalAmount: string
  totalCount: string
}

const settingPerMatchLimitSettingSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        namePlatform TEXT,
        limitMethod TEXT,

        limitType TEXT,
        totalAmount TEXT,
        totalCount TEXT
      `

export default settingPerMatchLimitSettingSchema
