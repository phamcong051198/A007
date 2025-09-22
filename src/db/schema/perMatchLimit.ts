export type PerMatchLimitType = {
  id: number
  league: string
  home: string
  away: string
  type: string
  hdp_point: number
  odd: number
  betAmount_Standard: string
  idAccount: number
}

const perMatchLimitSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        league TEXT,
        home TEXT,
        away TEXT,
        type TEXT,
        hdp_point REAL,
        odd REAL,
        betAmount_Standard TEXT,
        idAccount INTEGER,

        FOREIGN KEY (idAccount) REFERENCES Account(id) ON DELETE CASCADE
      `
export default perMatchLimitSchema
