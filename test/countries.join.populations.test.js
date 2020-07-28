import { tableToSamples }      from '@analys/convert'
import { LEFT }                from '@analys/enum-join-modes'
import { tableJoin }           from '@analys/table-join'
import { decoSamples, logger } from '@spare/logger'
import { countries }           from '../resources/data/countries'
import { populations }         from '../resources/data/populations'

/** @typedef {number|string} str */

const joinedTable = tableJoin(countries, populations, ['id'], LEFT)

// joinedTable |> decoTable |> logger

joinedTable |> tableToSamples |> decoSamples |> logger
