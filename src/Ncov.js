import { Acq } from '@acq/acq'
import { TABLE } from '@analys/enum-tabular-types'
import { samplesToTable } from '@analys/convert'
import { Table } from '@analys/table'
import { NUM_DESC } from '@aryth/comparer'
import { MUTABLE } from '@analys/enum-mutabilities'
import { FIELDS } from '../resources/FIELDS'
import { CASES, CODE, COUNTRY_INFO, DEATHESINML, DEATHRATE, DEATHS, UPDATED } from '../resources/constants'

export class Ncov {
  static async latest ({ format = TABLE, sortBy = 'cases', top = 15, fields } = {}) {
    return await Acq.tabular({
      title: 'ncov',
      url: 'https://corona.lmao.ninja/countries',
      prep (samples) {
        const countryInfos = samples.map((s) => {
          s[DEATHRATE] = (s[DEATHS] / s[CASES] * 100)?.toFixed(2)
          return s[COUNTRY_INFO]
        })
        const table = Table
          .from(samplesToTable(samples, fields ?? FIELDS))
          .unshiftColumn(CODE, countryInfos.map(({ iso3 }) => iso3))
          .mutateColumn(UPDATED, x => new Date(x))
        const head = table.head
        if (head.includes(DEATHESINML)) table.mutateColumn(DEATHESINML, x => x?.toFixed(2))
        if (sortBy && head.includes(sortBy)) table.sort(sortBy, NUM_DESC, MUTABLE)
        if (top) table.rows.splice(top)
        return table
      },
      from: TABLE,
      to: format
    })
  }
}


