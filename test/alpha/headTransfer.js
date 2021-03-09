import { camelToVector } from '@spare/phrasing'
import { delogger } from '@spare/logger'
import { Verse } from '@spare/verse'

const candidates = [
  'country',
  'countryInfo',
  'cases',
  'deaths',
  'recovered',
  'active',
  'critical',
  'casesToday',
  'deathsToday',
  'updated',
  'cases/m*',
  'deaths/m*',
]

const entries = candidates.map(camel => {
  const upperSnake = camelToVector(camel).map(word => word.toUpperCase()).join('_')
  return [camel, upperSnake]
})

Verse.entries(entries) |> delogger
