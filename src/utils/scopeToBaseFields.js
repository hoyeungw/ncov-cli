import { BASE_FIELDS_GLOBAL } from '../../resources/fieldsGlobal'
import { BASE_FIELDS_US } from '../../resources/fieldsUs'

export const scopeToBaseFields = scope => {
  if (scope === 'latest') return BASE_FIELDS_GLOBAL
  if (scope === 'latestUS') return BASE_FIELDS_US
  return []
}
