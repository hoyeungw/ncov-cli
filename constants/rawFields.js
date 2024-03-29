import {
  ACTIVE,
  CASES,
  CASES_MILLION,
  CASES_TODAY,
  COUNTRY,
  COUNTRY_INFO,
  CONTINENT,
  CRITICAL,
  DEATHS,
  DEATHS_MILLION,
  DEATHS_TODAY,
  RECOVERED,
  STATE,
  UPDATED
} from './fields'

export const FIELDS_GLOBAL = [
  ['updated', UPDATED],
  ['country', COUNTRY],
  ['countryInfo', COUNTRY_INFO],
  ['continent', CONTINENT],
  ['cases', CASES],
  ['deaths', DEATHS],
  ['active', ACTIVE],
  ['critical', CRITICAL],
  ['recovered', RECOVERED],
  ['todayCases', CASES_TODAY],
  ['todayDeaths', DEATHS_TODAY],
  ['casesPerOneMillion', CASES_MILLION],
  ['deathsPerOneMillion', DEATHS_MILLION],
]

export const FIELDS_US = [
  ['state', STATE],
  ['cases', CASES],
  ['deaths', DEATHS],
  ['active', ACTIVE],
  ['todayCases', CASES_TODAY],
  ['todayDeaths', DEATHS_TODAY],
]
