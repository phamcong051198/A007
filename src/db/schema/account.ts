const accountSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        orderNumber INTEGER,

        loginID TEXT,
        password TEXT,

        limitMethod TEXT,
        livePreGame INTEGER,
        limitType TEXT,
        totalAmount TEXT,
        totalCount TEXT,


        platformName TEXT,
        loginURL TEXT,

        credit TEXT,
        textLog TEXT,

        customIP TEXT,
        proxyIP TEXT,
        proxyPort TEXT,
        proxyUsername TEXT,
        proxyPassword TEXT,
        proxyScope TEXT,

        typeCrawl TEXT,

        checkBoxBet INTEGER,
        checkBoxRefresh INTEGER,
        checkBoxAutoLogin INTEGER,
        checkBoxLockURL INTEGER,

        status TEXT,
        statusPair INTEGER,
        statusLogin TEXT,
        statusDelete INTEGER,

        cookie TEXT,
        host TEXT,
        socketUrl TEXT,
        parent_id TEXT
      `

export default accountSchema
