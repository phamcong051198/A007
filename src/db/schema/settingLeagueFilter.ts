const settingLeagueFilterSchema = `
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filterType TEXT,
          blockMajorLeague INTEGER,
          allowMajorLeague INTEGER
          `

export default settingLeagueFilterSchema
