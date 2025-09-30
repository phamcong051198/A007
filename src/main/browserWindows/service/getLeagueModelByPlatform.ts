import { createModel } from '@db/model'
import rootLeagueSchema from '@db/schema/rootLeague'

export function getLeagueModelByPlatform(name: string) {
  const safeName = name.replace(/\W/g, '')
  const modelName = `League_${safeName}`
  return createModel(modelName, rootLeagueSchema)
}
