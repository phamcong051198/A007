const settingSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        credit INTEGER,
        enable INTEGER,

        profitMin TEXT,
        profitMax TEXT,
        gameType TEXT
      `

export default settingSchema
