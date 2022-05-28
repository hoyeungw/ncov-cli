import { says }                                       from '@palett/says'
import { decoTable }                                  from '@spare/logger'
import { DEATHS }                                     from '../constants/fields'
import { ADMINREGION, INCOMELEVEL, LENDTYPE, REGION } from '../constants/rawOuterFields'
import { groupedStat }                                from '../src/statistics/groupedStat'
import { Ncov }                                       from '../src/Ncov'

export const test = async () => {
  const table = await Ncov.global({ top: 0 })
  // await regionByIncomeLevelCrosTab(table) |> decoCrostab |> says['region x incomeLevel']
  await groupedStat(table, { groupBy: INCOMELEVEL, sortBy: DEATHS }) |> decoTable |> says[REGION]
  // await incomeLevelsStat(table) |> decoTable |> says[INCOMELEVEL]
}

test()
