import CFonts from 'cfonts'
import inquirer from 'inquirer'
import ora from 'ora'
import { Cards } from '@palett/cards'
import { SAMPLES, TABLE } from '@analys/enum-tabular-types'
import { decoSamples, DecoTable, says } from '@spare/logger'
import { camelToSnake } from '@spare/phrasing'
import { range } from '@vect/vector-init'
import { fluoVector } from '@palett/fluo-vector'
import { zipper } from '@vect/vector-zipper'
import { SP } from '@spare/enum-chars'
import { Xr } from '@spare/xr'
import { now } from '@valjoux/timestamp'
import { Mag } from '@cliche/mag'
import { iso } from '@vect/object-init'
import { acquire } from '@vect/merge-acquire'
import { NUM } from '@typen/enum-data-types'
import { decoFlat } from '@spare/deco-flat'
import { Ncov } from './Ncov'
import { BASE_FIELDS, FIELDS, RATIO_FIELDS, TODAY_FIELDS } from '../resources/FIELDS'

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

    const { format, sortBy, top, fieldConfigs } = await inquirer.prompt([
      {
        name: 'sortBy',
        type: LIST,
        default: 'cases',
        message: 'By what field would you like to sort?',
        choices: FIELDS.map(([curr, proj]) => ({ name: camelToSnake(curr, SP), value: proj }))
      },
      {
        name: 'top',
        type: LIST,
        default: 29,
        message: 'How about narrow down to only top countries?',
        choices: zipper(COLORED_RANGE200, RANGE200, (name, value) => ({ name, value }))
      },
      {
        name: 'format',
        type: LIST,
        default: 0,
        message: 'What format would you prefer?',
        choices: [
          { name: 'Table', value: TABLE },
          { name: 'Samples', value: SAMPLES }
        ]
      },
      {
        name: 'fieldConfigs',
        type: CHECKBOX,
        message: 'Please (multiple) select additional configs.',
        choices: [
          { name: 'Show today', checked: false, value: TODAY },
          { name: 'Show ratios', checked: false, value: RATIO },
        ],
        filter (answers) { return iso(answers, true) }
      }
    ])
    const makeFields = ({ today, ratio } = {}) => {
      const fields = BASE_FIELDS
      if (today) acquire(fields, TODAY_FIELDS)
      if (ratio) acquire(fields, RATIO_FIELDS)
      return fields
    }
    const spn = ora(Xr('updating')['sortBy'](sortBy)['top'](top)['timestamp'](now()).toString()).start()
    await Ncov.latest({ format, sortBy, top, fields: makeFields(fieldConfigs) })
      .then(result => {
        spn.succeed(Xr('updated')['timestamp'](now()).toString())
        if (format === TABLE) result
          |> DecoTable({ read: x => typeof x === NUM ? mag.format(x) : decoFlat(x) })
          |> says['corona latest report']
        if (format === SAMPLES) result |> decoSamples |> says['corona latest report']
      })
  }
}

if (process.argv[2] === 'start') NcovCli.start().then()


