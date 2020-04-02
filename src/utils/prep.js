import { CASES, CODE, COUNTRY_INFO, DEATH_RATE, DEATHS, DEATHS_MILLION, UPDATED } from '../../resources/constants.fields'
import { Table } from '@analys/table'
import { samplesToTable } from '@analys/convert'
import { NUM_DESC } from '@aryth/comparer'
import { MUTABLE } from '@analys/enum-mutabilities'

export const prep = function (samples, { sortBy, top, fields }) {
  const table = Table
    .from(samplesToTable(samples, fields))
    .pushColumn(DEATH_RATE, samples.map(s => (s[DEATHS] / s[CASES] * 100)?.toFixed(2)))
  if (table.head.includes(COUNTRY_INFO)) table.unshiftColumn(CODE, samples.map(getCountryIso)).spliceColumns([COUNTRY_INFO], MUTABLE)
  if (table.head.includes(UPDATED)) table.mutateColumn(UPDATED, x => new Date(x))
  if (table.head.includes(DEATHS_MILLION)) table.mutateColumn(DEATHS_MILLION, x => x?.toFixed(2))
  if (table.head.includes(sortBy)) table.sort(sortBy, NUM_DESC, MUTABLE)
  if (top) table.rows.splice(top)
  return table
}

/**
 *
 * @param {Object} s
 * @param {Object} s.countryInfo
 * @param {string} s.countryInfo.iso3
 * @return {*}
 */
const getCountryIso = s => s?.countryInfo?.iso3