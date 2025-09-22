const loginSchedulerSettingSchema = `
          id INTEGER PRIMARY KEY AUTOINCREMENT,

          typeSetting TEXT,

          isSchedulerEnabled INTEGER,
          selectedDays TEXT,
          timeValue TEXT,
          dateValue TEXT
          `

export default loginSchedulerSettingSchema
