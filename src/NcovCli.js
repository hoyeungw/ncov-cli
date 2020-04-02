import CFonts from 'cfonts'
import inquirer from 'inquirer'
import ora from 'ora'
import { Cards } from '@palett/cards'
import { SAMPLES, TABLE } from '@analys/enum-tabular-types'
import { decoSamples, DecoTable, logger, says } from '@spare/logger'
import { range } from '@vect/vector-init'
import { fluoVector } from '@palett/fluo-vector'
import { zipper } from '@vect/vector-zipper'
import { Xr } from '@spare/xr'
import { now } from '@valjoux/timestamp'
import { Mag } from '@cliche/mag'
import { NUM } from '@typen/enum-data-types'
import { decoFlat } from '@spare/deco-flat'
import { Ncov } from './Ncov'
import { FIELDS_CHECKBOX_OPTIONS_GLOBAL } from '../resources/fieldsGlobal'
import { FIELDS_CHECKBOX_OPTIONS_US } from '../resources/fieldsUs'
import { scopeToBaseFields } from './utils/scopeToBaseFields'
import { GLOBAL, USA } from '../resources/constants.scope'

const LIST = 'list', CHECKBOX = 'checkbox', TODAY = 'today', RATIO = 'ratio'
const RANGE200 = range(1, 200)
const COLORED_RANGE200 = fluoVector(RANGE200)
const mag = new Mag(0)

export class NcovCli {
  static async start () {
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
      message: 'Do you want to check global or states in the US?',
      choices: [
        { name: 'global', value: GLOBAL },
        { name: 'the United States', value: USA }
      ]
    }])
    const { fields } = await inquirer.prompt([{
      name: 'fields',
      type: CHECKBOX,
      message: 'Please (multiple) select additional fields.',
      choices: scope === 'latest' ? FIELDS_CHECKBOX_OPTIONS_GLOBAL : FIELDS_CHECKBOX_OPTIONS_US,
      filter (answers) { return Array.prototype.concat.apply(scopeToBaseFields(scope), answers) }
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

    const spn = ora(Xr('updating')['sortBy'](sortBy)['top'](top)['timestamp'](now()).toString()).start()
    await Ncov[scope]({ format, sortBy, top, fields })
      .then(result => {
        spn.succeed(Xr('updated')['scope'](scope)['timestamp'](now()).toString())
        if (format === TABLE) result
          |> DecoTable({ read: x => typeof x === NUM ? mag.format(x) : decoFlat(x) })
          |> says['corona latest report']
        if (format === SAMPLES) result |> decoSamples |> says['corona latest report']
      })

    '' |> logger
  }
}




