import { ACTIVE, CASES, CASES_TODAY, DEATH_RATE, DEATHS, DEATHS_TODAY, STATE } from './constants.fields'

export const BASE_FIELDS_US = [
  STATE,
  CASES,
  DEATHS,
  ACTIVE,
]

export const RATIO_FIELDS_US = [
  DEATH_RATE,
]

export const TODAY_FIELDS_US = [
  CASES_TODAY,
  DEATHS_TODAY
]

export const FIELDS_CHECKBOX_OPTIONS_US = [
  { name: 'show ratios', checked: true, value: RATIO_FIELDS_US },
  { name: 'show today', checked: false, value: TODAY_FIELDS_US },
]
