import { Acq }                      from '@acq/acq'
import { TABLE }                    from '@analys/enum-tabular-types'
import { FIELDS_GLOBAL, FIELDS_US } from '../resources/constants/rawFields'
import { BASE }                     from '../resources/constants/urls'
import { prep }                     from './utils/prep'

export class Ncov {
  static async global({ sortBy = 'cases', top = 15, fields } = {}) {
    return await Acq.tabular({
      title: 'ncov.global',
      url: `${ BASE }/countries`,
      prep,
      args: { sortBy, top, fields: FIELDS_GLOBAL },
      fields,
      from: TABLE,
      to: TABLE,
    })
  }

  static async usa({ sortBy = 'cases', top = 15, fields } = {}) {
    return await Acq.tabular({
      title: 'ncov.us',
      url: `${ BASE }/states`,
      prep,
      args: { sortBy, top, fields: FIELDS_US },
      fields,
      from: TABLE,
      to: TABLE
    })
  }
}


