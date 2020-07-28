import { LEFT }                                                 from '@analys/enum-join-modes'
import { COUNT, INCRE }                                         from '@analys/enum-pivot-mode'
import { Table }                                                from '@analys/table'
import { tableJoin }                                            from '@analys/table-join'
import { NUM_DESC }                                             from '@aryth/comparer'
import { init, iso, pair }                                      from '@vect/object-init'
import { CASES, CASES_MILLION, DEATH_RATE, DEATHS_MILLION, ID } from '../../resources/constants/constants.fields'
import { ADMINREGION, INCOMELEVEL, LENDTYPE, REGION }           from '../../resources/constants/rawOuterFields'
import { AdminRegions }                                         from '../../resources/data/AdminRegions'
import { IncomeLevels }                                         from '../../resources/data/IncomeLevels'
import { LendingTypes }                                         from '../../resources/data/LendingTypes'
import { Regions }                                              from '../../resources/data/Regions'
import { c12ns }                                                from '../utils/c12ns'

const GroupLabels = init([
  [REGION, Regions],
  [ADMINREGION, AdminRegions],
  [INCOMELEVEL, IncomeLevels],
  [LENDTYPE, LendingTypes]
])

export const groupedStat = async (table, { groupBy = REGION, sortBy = CASES, restFields = [] } = {}) => {
  table = Table
    .from(tableJoin(table, c12ns, [ID], LEFT))
    .group({
      key: groupBy,
      field: {
        country: COUNT,
        cases: INCRE,
        deaths: INCRE,
        population: INCRE,
        ...iso(restFields, INCRE)
      },
      filter: pair(groupBy, x => !!x)
    })
    .formula(init([
        [CASES_MILLION, (cases, population) => (cases / population * 1E+6).toFixed(2)],
        [DEATHS_MILLION, (deaths, population) => (deaths / population * 1E+6).toFixed(2)],
        [DEATH_RATE, (cases, deaths) => (deaths / cases * 100).toFixed(2)],
      ])
    )
  if (groupBy in GroupLabels) table.mutateColumn(groupBy, x => GroupLabels[groupBy][x])
  if (sortBy) table.sort(sortBy, NUM_DESC)
  return table
}
