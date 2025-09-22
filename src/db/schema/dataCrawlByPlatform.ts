const dataCrawlByPlatformSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        platform TEXT,

        idLeague INTEGER NOT NULL,
        uuidLeague TEXT,
        nameLeague TEXT NOT NULL,

        idEvent INTEGER NOT NULL,
        isHomeStrong INTEGER,

        nameHome TEXT NOT NULL,
        nameAway TEXT NOT NULL,

        score TEXT,
        redCard TEXT,
        stat TEXT,
        type TEXT,
              
        number INTEGER NOT NULL,
        submatch_id INTEGER,
        altLineId INTEGER,
        marketSelectionId_home_over INTEGER,
        marketSelectionId_away_under INTEGER,
        hdp_point REAL NOT NULL,
        home_over REAL NOT NULL,
        away_under REAL NOT NULL,
        typeOdd TEXT NOT NULL,

        league TEXT,
        home TEXT,
        away TEXT,

        specialOdd INTEGER,
        betType INTEGER,

        HDP TEXT
      `
export default dataCrawlByPlatformSchema
