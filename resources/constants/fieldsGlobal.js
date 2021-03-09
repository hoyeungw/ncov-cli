import {
  ACTIVE,
  CASES,
  CASES_MILLION,
  CASES_TODAY,
  CONTINENT,
  COUNTRY,
  CRITICAL,
  DEATH_RATE,
  DEATHS,
  DEATHS_MILLION,
  DEATHS_TODAY,
  ID,
  RECOVERED,
  UPDATED
} from './constants.fields'

export const BASE_FIELDS_GLOBAL = [
  ID,
  UPDATED,
  COUNTRY,
  CASES,
  DEATHS,
  ACTIVE,
]

export const RATIO_FIELDS_GLOBAL = [
  DEATH_RATE,
  CASES_MILLION,
  DEATHS_MILLION
]

export const TODAY_FIELDS_GLOBAL = [
  CASES_TODAY,
  DEATHS_TODAY
]

export const DETAIL_FIELDS_GLOBAL = [
  RECOVERED,
  CRITICAL,
]

export const REGION_INFO_FIELDS_GLOBAL = [
  CONTINENT
]

export const FIELDS_CHECKBOX_OPTIONS_GLOBAL = [
  { name: 'show ratios', checked: true, value: RATIO_FIELDS_GLOBAL },
  { name: 'show today', checked: false, value: TODAY_FIELDS_GLOBAL },
  { name: 'show details', checked: false, value: DETAIL_FIELDS_GLOBAL },
  { name: 'show region information', checked: true, value: REGION_INFO_FIELDS_GLOBAL },
]

