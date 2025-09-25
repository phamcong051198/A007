const settingSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enable INTEGER,

        profitMin TEXT,
        profitMax TEXT,
        gameType TEXT,
        
        schedulerRunning INTEGER,
        schedulerInputRunning TEXT,
        schedulerToday INTEGER,
        schedulerInputToday TEXT,
        schedulerEarly INTEGER,
        schedulerInputEarly TEXT,

        enableFirstStHalf INTEGER,
        betFirstHalf INTEGER,
        betFullTime INTEGER,
        firstStHalfBettingForm TEXT,
        firstStHalfBettingUntil TEXT,

        enableSecondStHalf INTEGER,
        betHalfTime INTEGER,
        secondStHalfBettingForm TEXT,
        secondStHalfBettingUntil TEXT,

        bettingMode TEXT,
        amountRoundingEnabled INTEGER,
        roundType TEXT,
        roundingNumber INTEGER,

        enablePerMatchLimitSetting INTEGER,

        ipAddress TEXT,
        port TEXT,
        username TEXT,
        password TEXT,

        oddsLessThan INTEGER,
        oddsMoreThan INTEGER,
        gameCommissionMoreThan INTEGER,
        gameCommissionLessThan INTEGER,

        oddsLessThanValue TEXT,
        oddsMoreThanValue TEXT,
        gameCommissionMoreThanValue TEXT,
        gameCommissionLessThanValue TEXT,

        enableRandomizer INTEGER,
        fromRandomizer TEXT,
        toRandomizer TEXT,

        isOther INTEGER,
        isBetUnderSelected INTEGER,
        isBetOverSelected INTEGER,
        isBetPutSelected INTEGER,
        isBetEatSelected INTEGER
      `

export default settingSchema
