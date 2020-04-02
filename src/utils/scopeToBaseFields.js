import { BASE_FIELDS_GLOBAL } from '../../resources/fieldsGlobal'
import { BASE_FIELDS_US } from '../../resources/fieldsUs'
import { GLOBAL, USA } from '../../resources/constants.scope'

export const scopeToBaseFields = scope => {
  if (scope === GLOBAL) return BASE_FIELDS_GLOBAL
  if (scope === USA) return BASE_FIELDS_US
  return []
}
