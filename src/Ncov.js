import { Acq }                                                                  from '@acq/acq'
import { samplesToTable }                                                       from '@analys/convert'
import { TABLE }                                                                from '@analys/enum-tabular-types'
import { Table }                                                                from '@analyz/table'
import { NUM_DESC }                                                             from '@aryth/comparer'
import { CASES, COUNTRY_INFO, DEATH_RATE, DEATHS, DEATHS_MILLION, ID, UPDATED } from '../constants/fields'
import { FIELDS_GLOBAL, FIELDS_US }                                             from '../constants/rawFields'
import { BASE }                                                                 from '../constants/urls'

export class Ncov {
  static async global({sortBy = 'cases', top = 15, fields} = {}) {
    return await Acq.tabular({
      title: 'ncov.global',
      url: `${BASE}/countries`,
      prep,
      args: {sortBy, top, fields: FIELDS_GLOBAL},
      fields,
      from: TABLE,
      to: TABLE,
    })
  }

  static async usa({sortBy = 'cases', top = 15, fields} = {}) {
    return await Acq.tabular({
      title: 'ncov.us', url: `${BASE}/states`, prep, args: {sortBy, top, fields: FIELDS_US}, fields, from: TABLE, to: TABLE
    })
  }
}

export function prep(samples, {sortBy, top, fields}) {
  const table = Table.from(samplesToTable(samples, fields))
  table.headward
    .prepend(ID, samples.map(getCountryIso))
    .delete(COUNTRY_INFO)
    .append(DEATH_RATE, samples.map(s => (s[DEATHS] / s[CASES] * 100)?.toFixed(2)))
    .mutate(UPDATED, x => new Date(x))
    .mutate(DEATHS_MILLION, x => x?.toFixed(2))
  table.sort(sortBy, NUM_DESC)
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


