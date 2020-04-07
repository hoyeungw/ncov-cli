import { LEFT, tableJoin } from '@analys/table-join'
import { Table } from '@analys/table'
import { COUNT, INCRE } from '@analys/enum-pivot-mode'
import { isNumeric } from '@typen/num-strict'
import { mutate } from '@vect/vector-mapper'
import { iso } from '@vect/vector-init'
import { adjoin } from '@spare/phrasing'
import { wind } from '@vect/entries-init'
import { NUM_DESC } from '@aryth/comparer'
import { CrosTab } from '@analys/crostab'
import { countries } from '../resources/data/countries'
import { populations } from '../resources/data/populations'
import { CASES, CASES_MILLION, DEATH_RATE, DEATHS, DEATHS_MILLION, ID } from '../resources/constants/constants.fields'
import { INCOMELEVEL, REGION } from '../resources/constants/rawOuterFields'
import { Regions } from '../resources/data/Regions'
import { IncomeLevels } from '../resources/data/IncomeLevels'

const refTable = tableJoin(countries, populations, [ID], LEFT)

const Filters = {
  get numeric () { return { population: isNumeric, cases: isNumeric } }
}
const Formulas = {
  get count () {return { field: { country: COUNT }, filter: Filters.numeric, indicator: 'count' }},
  get cases () {return { field: { cases: INCRE }, filter: Filters.numeric, indicator: CASES }},
  get deaths () {return { field: { deaths: INCRE }, filter: Filters.numeric, indicator: DEATHS }},
  get population () {return { field: { population: INCRE }, filter: Filters.numeric, indicator: 'population' }},
  get casesInMillion () {
    return {
      field: { cases: INCRE, population: INCRE },
      filter: Filters.numeric,
      formula: (cases, population) => (cases / population * 1E+6).toFixed(2),
      indicator: CASES_MILLION
    }
  },
  get deathsInMillion () {
    return {
      field: { deaths: INCRE, population: INCRE },
      filter: Filters.numeric,
      formula: (deaths, population) => (deaths / population * 1E+6).toFixed(2),
      indicator: DEATHS_MILLION
    }
  },
  get deathRate () {
    return {
      field: { deaths: INCRE, cases: INCRE },
      filter: Filters.numeric,
      formula: (deaths, cases) => (deaths / cases * 100).toFixed(2),
      indicator: DEATH_RATE
    }
  },
}
const Fields = {
  get regionSet () { return { side: REGION, sideFields: Regions } },
  get incomeLevelSet () { return { side: INCOMELEVEL, sideFields: IncomeLevels } }
}

export const regionByIncomeLevelCrosTab = async (dataTable) => {
  // const dataTable = await Ncov.global({ top: 0 })
  const table = tableJoin(dataTable, refTable, [ID], LEFT) |> Table.from
  const crostab = table.crosTab({
    side: REGION,
    banner: INCOMELEVEL,
    field: { cases: INCRE, population: INCRE, country: COUNT },
    filter: { population: isNumeric },
    formula: (cases, population, country) => (cases / population * 1E+6).toFixed(2)
  }) |> CrosTab.from
  mutate(crostab.side, x => Regions[x])
  mutate(crostab.head, x => IncomeLevels[x])
  return crostab
}

export const regionsStat = async (dataTable) => {
  // const dataTable = await Ncov.global({ top: 0 })
  const table = tableJoin(dataTable, refTable, [ID], LEFT) |> Table.from
  let t = chipStat(table, { ...Fields.regionSet, ...Formulas.count })
  t = tableJoin(t, chipStat(table, { ...Fields.regionSet, ...Formulas.cases }), [REGION], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.regionSet, ...Formulas.deaths }), [REGION], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.regionSet, ...Formulas.population }), [REGION], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.regionSet, ...Formulas.casesInMillion }), [REGION], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.regionSet, ...Formulas.deathsInMillion }), [REGION], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.regionSet, ...Formulas.deathRate }), [REGION], LEFT)
  return Table.from(t).sort(CASES, NUM_DESC)
}

export const incomeLevelsStat = async (dataTable) => {
  // const dataTable = await Ncov.global({ top: 0 })
  const table = tableJoin(dataTable, refTable, [ID], LEFT) |> Table.from
  let t = chipStat(table, { ...Fields.incomeLevelSet, ...Formulas.count })
  t = tableJoin(t, chipStat(table, { ...Fields.incomeLevelSet, ...Formulas.cases }), [INCOMELEVEL], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.incomeLevelSet, ...Formulas.deaths }), [INCOMELEVEL], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.incomeLevelSet, ...Formulas.population }), [INCOMELEVEL], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.incomeLevelSet, ...Formulas.casesInMillion }), [INCOMELEVEL], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.incomeLevelSet, ...Formulas.deathsInMillion }), [INCOMELEVEL], LEFT)
  t = tableJoin(t, chipStat(table, { ...Fields.incomeLevelSet, ...Formulas.deathRate }), [INCOMELEVEL], LEFT)
  return Table.from(t).sort(CASES, NUM_DESC)
}

const chipStat = (table, { side, field, filter, formula, sideFields, indicator }) => {
  if (table.coin('_') < 0) table.unshiftColumn('_', iso(table.ht, ''))
  const crostab = table.crosTab({
    side,
    banner: '_',
    field,
    filter,
    formula,
  })
  if (sideFields) mutate(crostab.side, x => sideFields[x] ?? x)
  const title = adjoin(indicator, 'by', side)
  const head = [side, indicator]
  const rows = wind(crostab.side, crostab.rows.map(([v]) => v))
  return Table.from({ head, rows, title }).sort(indicator, NUM_DESC)
}
