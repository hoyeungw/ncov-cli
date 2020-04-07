import { decoCrostab, decoTable } from '@spare/logger'
import { says } from '@palett/says'
import { INCOMELEVEL, REGION } from '../resources/constants/rawOuterFields'
import { incomeLevelsStat, regionByIncomeLevelCrosTab, regionsStat } from '../src/derivatives'
import { Ncov } from '../src/Ncov'

export const test = async () => {
  const table = await Ncov.global({ top: 0 })
  await regionByIncomeLevelCrosTab(table) |> decoCrostab |> says['region x incomeLevel']
  await regionsStat(table) |> decoTable |> says[REGION]
  await incomeLevelsStat(table) |> decoTable |> says[INCOMELEVEL]
}

test()
