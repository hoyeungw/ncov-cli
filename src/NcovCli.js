import { SAMPLES, TABLE }                                  from '@analys/enum-tabular-types'
import { Mag }                                             from '@cliche/mag'
import { Cards }                                           from '@palett/cards'
import { fluoVector }                                      from '@palett/fluo-vector'
import { decoFlat }                                        from '@spare/deco-flat'
import { decoSamples, decoTable, DecoTable, logger, says } from '@spare/logger'
import { Xr }                                              from '@spare/xr'
import { NUM }                                             from '@typen/enum-data-types'
import { time }                                            from '@valjoux/timestamp-pretty'
import { range }                                           from '@vect/vector-init'
import { zipper }                                          from '@vect/vector-zipper'
import CFonts                                              from 'cfonts'
import inquirer                                            from 'inquirer'
import ora                                                 from 'ora'
import {
  CASES,
  CASES_MILLION,
  COUNTRY,
  DEATH_RATE,
  DEATHS,
  DEATHS_MILLION
}                                                          from '../resources/constants/constants.fields'
import {
  GLOBAL,
  STAT,
  USA
}                                                          from '../resources/constants/constants.scope'
import {
  DETAIL_FIELDS_GLOBAL,
  FIELDS_CHECKBOX_OPTIONS_GLOBAL,
  TODAY_FIELDS_GLOBAL
}                                                          from '../resources/constants/fieldsGlobal'
import { FIELDS_CHECKBOX_OPTIONS_US }                      from '../resources/constants/fieldsUs'
import {
  ADMINREGION,
  INCOMELEVEL,
  POPULATION,
  REGION
}                                                          from '../resources/constants/rawOuterFields'
import { groupedStat }                                     from './groupedStat/groupedStat'
import { Ncov }                                            from './Ncov'
import { scopeToBaseFields }                               from './utils/scopeToBaseFields'

const LIST = 'list', CHECKBOX = 'checkbox', TODAY = 'today', RATIO = 'ratio'
const RANGE200 = range(1, 200)
const COLORED_RANGE200 = fluoVector(RANGE200)
const mag = new Mag(0)

export class NcovCli {
  static async start() {
    CFonts.say('NCOV update', {
      font: 'simple',             // define the font face
      background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
      space: false,               // define if the output text should have empty lines on top and on the bottom
      maxLength: 16,              // define how many character can be on one line
      gradient: [Cards.cyan.accent_3, Cards.pink.lighten_2], // define your two gradient colors
    })
    '' |> logger

    const { scope } = await inquirer.prompt([{
      name: 'scope',
      type: LIST,
      default: 0,
      message: 'Do you want to check global, states in the US, or general statistics?',
      choices: [
        { name: 'global', value: GLOBAL },
        { name: 'the United States', value: USA },
        { name: 'general statistics', value: STAT },
      ]
    }])
    if (scope === STAT) {
      const spn = ora(Xr('updating').timestamp(time()).toString()).start()
      const table = await Ncov.global({ top: 0 })
      spn.succeed(Xr('updated').scope(scope).timestamp(time()).toString())
      const { fields } = await inquirer.prompt([{
        name: 'fields',
        type: CHECKBOX,
        message: 'Please (multiple) select additional fields.',
        choices: [
          { name: 'show today', checked: false, value: TODAY_FIELDS_GLOBAL },
          { name: 'show details', checked: false, value: DETAIL_FIELDS_GLOBAL },
        ],
        filter(answers) { return [].concat(...answers) }
      }])
      const { sortBy } = await inquirer.prompt([{
        name: 'sortBy',
        type: LIST,
        default: 'cases',
        message: 'By what field would you like to sort?',
        choices: [COUNTRY, CASES, DEATHS, POPULATION, CASES_MILLION, DEATHS_MILLION, DEATH_RATE].concat(fields)
      }])
      '' |> logger
      await groupedStat(table, { groupBy: REGION, sortBy, restFields: fields }) |> decoTable |> says[REGION]
      '' |> logger
      await groupedStat(table, { groupBy: INCOMELEVEL, sortBy, restFields: fields }) |> decoTable |> says[INCOMELEVEL]
      '' |> logger
      await groupedStat(table, { groupBy: ADMINREGION, sortBy, restFields: fields }) |> decoTable |> says[ADMINREGION]
      '' |> logger
      return void 0
    }
    const { fields } = await inquirer.prompt([{
      name: 'fields',
      type: CHECKBOX,
      message: 'Please (multiple) select additional fields.',
      choices: scope === GLOBAL ? FIELDS_CHECKBOX_OPTIONS_GLOBAL : FIELDS_CHECKBOX_OPTIONS_US,
      filter(answers) { return scopeToBaseFields(scope).concat(...answers) }
    }])
    const { sortBy, top, format } = await inquirer.prompt([
      {
        name: 'sortBy',
        type: LIST,
        default: 'cases',
        message: 'By what field would you like to sort?',
        choices: fields.map(field => ({ name: field, value: field })) // camelToSnake(field, SP)
      },
      {
        name: 'top',
        type: LIST,
        default: 29,
        message: 'Narrow down to only top countries?',
        choices: zipper(COLORED_RANGE200, RANGE200, (name, value) => ({ name, value }))
      },
      {
        name: 'format',
        type: LIST,
        default: TABLE,
        message: 'What tabular format do you prefer?',
        choices: [
          { name: 'table', value: TABLE },
          { name: 'samples', value: SAMPLES }
        ]
      }
    ])

    const spn = ora(Xr('updating')['sortBy'](sortBy)['top'](top)['timestamp'](time()).toString()).start()
    await Ncov[scope]({ format, sortBy, top, fields })
      .then(result => {
        spn.succeed(Xr('updated')['scope'](scope)['timestamp'](time()).toString())
        if (format === TABLE) result
          |> DecoTable({ read: x => typeof x === NUM ? mag.format(x) : decoFlat(x) })
          |> says['corona latest report'].br(scope)
        if (format === SAMPLES) result |> decoSamples |> says['corona latest report']
      })

    '' |> logger
  }
}




