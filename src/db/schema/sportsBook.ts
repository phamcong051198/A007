const sportsBookSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        delayNormal TEXT,
        delaySameGame TEXT,
        suggestedClient TEXT,
        delayLoginSec_from TEXT,
        delayLoginSec_to TEXT,
        switchIntervalSetting_from TEXT,
        switchIntervalSetting_to TEXT,
        switchIntervalSettingMinutes TEXT,
        accountType TEXT,
        switchAccountSetting TEXT,
        hight_account TEXT,
        VIPAccountLogout INTEGER,

        valueRange INTEGER
      `

export default sportsBookSchema
