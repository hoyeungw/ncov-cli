import { decoTable, logger } from '@spare/logger'
import { Ncov } from '../src/Ncov'

const test = async () => {
  await Ncov
    .latest()
    .then(table => {
      table |> decoTable |> logger
    })
}

test()
