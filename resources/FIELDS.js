export const BASE_FIELDS=[
  ['country'            ,'country'],
  ['cases'              ,'cases'],
  ['deaths'             ,'deaths'],
  ['recovered'          ,'recovered'],
  ['active'             ,'active'],
  ['critical'           ,'critical'],
  ['updated'            ,'updated'],
]

export const TODAY_FIELDS=[
  ['todayCases'         ,'casesToday'],
  ['todayDeaths'        ,'deathsToday'],
]

export const RATIO_FIELDS=[
  ['deathRate'          ,'death %'],
  ['casesPerOneMillion' ,'cases/m*'],
  ['deathsPerOneMillion','deaths/m*'],
]

export const FIELDS=[
  ...BASE_FIELDS,
  ...TODAY_FIELDS,
  ...RATIO_FIELDS
]
