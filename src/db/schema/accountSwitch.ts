const accountSwitchSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        loginID TEXT,
        password TEXT,
        loginURL TEXT,
        customIP TEXT,
        proxyIP TEXT,
        proxyPort TEXT,
        proxyUsername TEXT,
        proxyPassword TEXT,
        proxyScope TEXT,

        platformName TEXT
      `

export default accountSwitchSchema
