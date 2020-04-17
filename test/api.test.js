import { decoTable, logger } from '@spare/logger'
import { Ncov } from '../src/Ncov'
import { BASE_FIELDS_GLOBAL } from '../resources/constants/fieldsGlobal'

const test = async () => {
  await Ncov
    .usa({ fields: BASE_FIELDS_GLOBAL })
    .then(table => {
      table |> decoTable |> logger
    })
}

test()
