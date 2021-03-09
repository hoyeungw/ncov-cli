import { tableToSamples }      from '@analys/convert'
import { LEFT }                from '@analys/enum-join-modes'
import { tableJoin }           from '@analys/table-join'
import { decoSamples, logger } from '@spare/logger'
import { CountryTable }        from '@volks/worldbank-countries'

import { PopulationTable } from '../resources/data/PopulationTable'

/** @typedef {number|string} str */

const joinedTable = tableJoin(CountryTable, PopulationTable, ['id'], LEFT)

// joinedTable |> decoTable |> logger

joinedTable |> tableToSamples |> decoSamples |> logger
