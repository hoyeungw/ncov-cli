import { TABLE }               from './static/global'
import { Table }               from '@analyz/table'
import { decoTable }           from '@spare/logger'
import { COUNTRY, DEATHS }     from '../constants/fields'
import { renameCountry }       from '../src/infrastructure/renameCountry'
import { groupedStat }         from '../src/statistics/groupedStat'
import { INCOMELEVEL, REGION } from '../constants/rawOuterFields'
import { says }                from '@palett/says'


export const test = async () => {
  const table = Table.from(TABLE)
  table.headward.mutate(COUNTRY, renameCountry)
  // await regionByIncomeLevelCrosTab(table) |> decoCrostab |> says['region x incomeLevel']
  await groupedStat(table, { groupBy: INCOMELEVEL, sortBy: DEATHS }) |> decoTable |> says[REGION]
  // await incomeLevelsStat(table) |> decoTable |> says[INCOMELEVEL]
}

test().then()