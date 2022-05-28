import { tableToSamples }      from '@analys/convert'
import { LEFT }                from '@analys/enum-join-modes'
import { tableJoin }           from '@analys/table-join'
import { Algebra }                        from '@analyz/table-algebra'
import { decoSamples, decoTable, logger } from '@spare/logger'
import { CountryTable }                   from '@volks/worldbank-countries'

import { PopulationTable } from '../resources/PopulationTable'

/** @typedef {number|string} str */

const table = Algebra.join(LEFT, [ 'id' ], '', CountryTable, PopulationTable)

table |> decoTable |> logger

// table |> tableToSamples |> decoSamples |> logger
