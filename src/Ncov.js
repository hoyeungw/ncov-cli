import { Acq } from '@acq/acq'
import { TABLE } from '@analys/enum-tabular-types'
import { prep } from './utils/prep'
import { BASE } from '../resources/urls'
import { FIELDS_GLOBAL, FIELDS_US } from '../resources/FIELDS.RAW'

export class Ncov {
  static async latest ({ format = TABLE, sortBy = 'cases', top = 15, fields } = {}) {
    return await Acq.tabular({
      title: 'ncov.global',
      url: `${BASE}/countries`,
      prep,
      args: { sortBy, top, fields: FIELDS_GLOBAL },
      fields,
      from: TABLE,
      to: format
    })
  }

  static async latestUS ({ format = TABLE, sortBy = 'cases', top = 15, fields } = {}) {
    return await Acq.tabular({
      title: 'ncov.us',
      url: `${BASE}/states`,
      prep,
      args: { sortBy, top, fields: FIELDS_US },
      fields,
      from: TABLE,
      to: format
    })
  }
}


