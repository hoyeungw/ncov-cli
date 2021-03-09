import { decoTable, logger }  from '@spare/logger'
import { BASE_FIELDS_GLOBAL } from '../resources/constants/fieldsGlobal'
import { Ncov }               from '../src/Ncov'

const test = async () => {
  await Ncov
    .global({ fields: BASE_FIELDS_GLOBAL })
    .then(table => {
      table |> decoTable |> logger
    })
}

test()
