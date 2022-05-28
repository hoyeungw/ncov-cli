import { LEFT }            from '@analys/enum-join-modes'
import { tableJoin }       from '@analys/table-join'
import { CountryTable }    from '@volks/worldbank-countries'
import { ID }              from '../constants/fields'
import { PopulationTable } from './PopulationTable'

export const ConsolidatedCountryTable = tableJoin(CountryTable, PopulationTable, [ID], LEFT)
