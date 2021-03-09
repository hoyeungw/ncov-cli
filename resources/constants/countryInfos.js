import { Table }        from '@analys/table'
import { CountryTable } from '@volks/worldbank-countries'

export const countryTable = Table.from(CountryTable).select(['id', 'region', 'capitalCity'])