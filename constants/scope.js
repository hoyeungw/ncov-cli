import { BASE_FIELDS_GLOBAL } from './fieldsGlobal'
import { BASE_FIELDS_US }     from './fieldsUs'

export const
  GLOBAL = 'global',
  USA    = 'usa',
  STAT   = 'stat'

export class Scope {
  static baseFields(scope) {
    if (scope === GLOBAL) return BASE_FIELDS_GLOBAL
    if (scope === USA) return BASE_FIELDS_US
    return []
  }
}