import { LEFT }                                                                      from '@analys/enum-join-modes'
import { TABLE }                                                                     from '@analys/enum-tabular-types'
import { Algebra }                                                                   from '@analyz/table-algebra'
import { Mag }                                                                       from '@cliche/mag'
import { Cards }                                                                     from '@palett/cards'
import { fluoVector }                                                                from '@palett/fluo-vector'
import { FRESH }                                                                     from '@palett/presets'
import { decoTable, DecoTable }                                                      from '@spare/logger'
import { Xr, says }                                                                  from '@spare/xr'
import { time }                                                                      from '@valjoux/timestamp-pretty'
import { merges }                                                                    from '@vect/vector-algebra'
import { indexes }                                                                   from '@vect/vector-init'
import { zipper }                                                                    from '@vect/vector-zipper'
import CFonts                                                                        from 'cfonts'
import inquirer                                                                      from 'inquirer'
import ora                                                                           from 'ora'
import { countryTable }                                                              from '../constants/countryInfos'
import { CASES, CASES_MILLION, COUNTRY, DEATH_RATE, DEATHS, DEATHS_MILLION }         from '../constants/fields'
import { DETAIL_FIELDS_GLOBAL, FIELDS_CHECKBOX_OPTIONS_GLOBAL, TODAY_FIELDS_GLOBAL } from '../constants/fieldsGlobal'
import { FIELDS_CHECKBOX_OPTIONS_US }                                                from '../constants/fieldsUs'
import { ADMINREGION, INCOMELEVEL, POPULATION, REGION }                              from '../constants/rawOuterFields'
import { GLOBAL, Scope, STAT, USA }                                                  from '../constants/scope'
import { Ncov }                                                                      from './Ncov'
import { groupedStat }                                                               from './statistics/groupedStat'

const SCOPE = 'scope', FIELDS = 'fields', NCOV_CLI = "ncov-cli"
const LIST = 'list', CHECKBOX = 'checkbox', TODAY = 'today', RATIO = 'ratio'
const RANGE200 = indexes(1, 200)
const COLORED_RANGE200 = fluoVector(RANGE200, [ FRESH ])
const mag = new Mag(0)
says.attach(time)

export class Cli {
  static async start() {
    CFonts.say('NCOV update', {
      font: 'simple',             // define the font face
      background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
      space: false,               // define if the output text should have empty lines on top and on the bottom
      maxLength: 16,              // define how many character can be on one line
      gradient: [ Cards.cyan.accent_3, Cards.pink.lighten_2 ], // define your two gradient colors
    })
    '' |> says[NCOV_CLI]

    const {scope} = await inquirer.prompt({
      name: SCOPE,
      type: LIST,
      default: 0,
      message: 'Do you want to check global, states in the US, or general statistics?',
      choices: [
        {name: 'global', value: GLOBAL},
        {name: 'the United States', value: USA},
        {name: 'general statistics', value: STAT},
      ]
    })
    if (scope === STAT) {
      const spn = ora(Xr('updating').timestamp(time()).toString()).start()
      const table = await Ncov.global({top: 0})
      spn.succeed(Xr('updated').scope(scope).timestamp(time()).toString())
      const {fields} = await inquirer.prompt([ {
        name: FIELDS,
        type: CHECKBOX,
        message: 'Please (multiple) select additional fields.',
        choices: [
          {name: 'show today', checked: false, value: TODAY_FIELDS_GLOBAL},
          {name: 'show details', checked: false, value: DETAIL_FIELDS_GLOBAL},
        ],
        filter(answers) { return merges(...answers) }
      } ])
      const {sortBy} = await inquirer.prompt([ {
        name: 'sortBy',
        type: LIST,
        default: 'cases',
        message: 'By what field would you like to sort?',
        choices: [ COUNTRY, CASES, DEATHS, POPULATION, CASES_MILLION, DEATHS_MILLION, DEATH_RATE ].concat(fields)
      } ])
      '' |> says[NCOV_CLI]
      await groupedStat(table, {groupBy: REGION, sortBy, restFields: fields}) |> decoTable |> says[REGION]
      '' |> says[NCOV_CLI]
      await groupedStat(table, {groupBy: INCOMELEVEL, sortBy, restFields: fields}) |> decoTable |> says[INCOMELEVEL]
      '' |> says[NCOV_CLI]
      await groupedStat(table, {groupBy: ADMINREGION, sortBy, restFields: fields}) |> decoTable |> says[ADMINREGION]
      '' |> says[NCOV_CLI]
      return void 0
    }
    const {fields} = await inquirer.prompt({
      name: 'fields',
      type: CHECKBOX,
      message: 'Please (multiple) select additional fields.',
      choices: scope === GLOBAL ? FIELDS_CHECKBOX_OPTIONS_GLOBAL : FIELDS_CHECKBOX_OPTIONS_US,
      filter(answers) { return Scope.baseFields(scope).concat(...answers) }
    })
    const {sortBy} = await inquirer.prompt({
      name: 'sortBy',
      type: LIST,
      default: fields.indexOf(CASES),
      message: 'By what field would you like to sort?',
      choices: fields.map(field => ({name: field, value: field})) // camelToSnake(field, SP)
    })
    const {top} = await inquirer.prompt({
      name: 'top',
      type: LIST,
      default: 79,
      message: 'Narrow down to only top CountryTable?',
      choices: zipper(COLORED_RANGE200, RANGE200, (name, value) => ({name, value}))
    })
    const spn = ora(Xr(NCOV_CLI).p(time()).p('updating').sortBy(sortBy).top(top).toString()).start()
    await Ncov[scope]({format: TABLE, sortBy, top, fields})
      .then(table => {
        spn.succeed(Xr(NCOV_CLI).p(time()).p('updated').scope(scope).toString())
        if (scope === GLOBAL) {
          table = Algebra.join(LEFT, [ 'id' ], '', table, countryTable,)
        }
        table
          |> DecoTable() // { read: x => typeof x === NUM ? mag.format(x) : decoFlat(x) }
          |> says[NCOV_CLI].br(scope)
      })
    '' |> says[NCOV_CLI]
  }
}




