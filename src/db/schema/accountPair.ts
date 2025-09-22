export type AccountPairDBType = {
  id: string
  isValid: number
  key: string
  account1: string
  account2: string
}

const accountPairSchema = `
            id TEXT PRIMARY KEY,
            
            isValid INTEGER,
            key TEXT,
            account1 TEXT,
            account2 TEXT
          `

export default accountPairSchema
