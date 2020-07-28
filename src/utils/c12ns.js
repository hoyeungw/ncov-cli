import { LEFT }        from '@analys/enum-join-modes'
import { tableJoin }   from '@analys/table-join'
import { ID }          from '../../resources/constants/constants.fields'
import { countries }   from '../../resources/data/countries'
import { populations } from '../../resources/data/populations'

export const c12ns = tableJoin(countries, populations, [ID], LEFT)

// c12ns |> decoTable |> logger
