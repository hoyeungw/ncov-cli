import { DecoTable, logger }     from '@spare/logger'
import { BASE_FIELDS_GLOBAL }    from '../constants/fieldsGlobal'
import { Ncov }                  from '../src/Ncov'
import { ARUBA, SUBTLE, SUMMER } from "@palett/presets";

const test = async () => {
  await Ncov
    .global({ fields: BASE_FIELDS_GLOBAL })
    .then(table => {
      table |> DecoTable({ presets: [SUMMER, ARUBA, SUBTLE] }) |> logger
    })
}

test()
