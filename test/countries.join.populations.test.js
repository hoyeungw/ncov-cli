import { countries } from '../resources/data/countries'
import { populations } from '../resources/data/populations'
import { LEFT, tableJoin } from '@analys/table-join'
import { decoSamples, decoTable, delogger, logger } from '@spare/logger'
import { tableToSamples } from '@analys/convert'

/** @typedef {number|string} str */

const joinedTable = tableJoin(countries, populations, ['id'], LEFT)

// joinedTable |> decoTable |> logger

joinedTable |> tableToSamples |> decoSamples |> logger
