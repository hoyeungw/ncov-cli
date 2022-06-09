import { says }                from '@palett/says'
import { decoTable }           from '@spare/logger'
import { DEATHS }              from '../constants/fields'
import { INCOMELEVEL, REGION } from '../constants/rawOuterFields'
import { groupedStat }         from '../src/statistics/groupedStat'
import { Ncov }                from '../src/Ncov'
import { promises }            from 'fs'
import { Verse }               from '@spare/verse'

const DEST = './test/static'

export const test = async () => {
  const table = await Ncov.global({ top: 0 })
  await promises.writeFile(DEST + '/global.js', 'export const TABLE = ' + Verse.table(table),)
  // await regionByIncomeLevelCrosTab(table) |> decoCrostab |> says['region x incomeLevel']
  await groupedStat(table, { groupBy: INCOMELEVEL, sortBy: DEATHS }) |> decoTable |> says[REGION]
  // await incomeLevelsStat(table) |> decoTable |> says[INCOMELEVEL]
}

test().then()
