import CFonts from 'cfonts';
import inquirer from 'inquirer';
import ora from 'ora';
import { Cards } from '@palett/cards';
import { TABLE, SAMPLES } from '@analys/enum-tabular-types';
import { logger, DecoTable, says, decoSamples } from '@spare/logger';
import { range } from '@vect/vector-init';
import { fluoVector } from '@palett/fluo-vector';
import { zipper } from '@vect/vector-zipper';
import { Xr } from '@spare/xr';
import { now } from '@valjoux/timestamp';
import { Mag } from '@cliche/mag';
import { NUM } from '@typen/enum-data-types';
import { decoFlat } from '@spare/deco-flat';
import { Acq } from '@acq/acq';
import { Table } from '@analys/table';
import { samplesToTable } from '@analys/convert';
import { NUM_DESC } from '@aryth/comparer';
import { MUTABLE } from '@analys/enum-mutabilities';

const STATE = 'state',
      COUNTRY = 'country',
      COUNTRY_INFO = 'countryInfo',
      CASES = 'cases',
      DEATHS = 'deaths',
      RECOVERED = 'recovered',
      ACTIVE = 'active',
      CRITICAL = 'critical',
      CASES_TODAY = 'casesToday',
      DEATHS_TODAY = 'deathsToday',
      UPDATED = 'updated',
      CASES_MILLION = 'cases/m*',
      DEATHS_MILLION = 'deaths/m*';
const CODE = 'code',
      DEATH_RATE = 'death %';

const prep = function (samples, {
  sortBy,
  top,
  fields
}) {
  const table = Table.from(samplesToTable(samples, fields)).pushColumn(DEATH_RATE, samples.map(s => {
    var _ref;

    return (_ref = s[DEATHS] / s[CASES] * 100) === null || _ref === void 0 ? void 0 : _ref.toFixed(2);
  }));
  if (table.head.includes(COUNTRY_INFO)) table.unshiftColumn(CODE, samples.map(getCountryIso)).spliceColumns([COUNTRY_INFO], MUTABLE);
  if (table.head.includes(UPDATED)) table.mutateColumn(UPDATED, x => new Date(x));
  if (table.head.includes(DEATHS_MILLION)) table.mutateColumn(DEATHS_MILLION, x => x === null || x === void 0 ? void 0 : x.toFixed(2));
  if (table.head.includes(sortBy)) table.sort(sortBy, NUM_DESC, MUTABLE);
  if (top) table.rows.splice(top);
  return table;
};
/**
 *
 * @param {Object} s
 * @param {Object} s.countryInfo
 * @param {string} s.countryInfo.iso3
 * @return {*}
 */

const getCountryIso = s => {
  var _s$countryInfo;

  return s === null || s === void 0 ? void 0 : (_s$countryInfo = s.countryInfo) === null || _s$countryInfo === void 0 ? void 0 : _s$countryInfo.iso3;
};

const BASE = 'https://corona.lmao.ninja';

const FIELDS_GLOBAL = [['updated', UPDATED], ['country', COUNTRY], ['countryInfo', COUNTRY_INFO], ['cases', CASES], ['deaths', DEATHS], ['active', ACTIVE], ['critical', CRITICAL], ['recovered', RECOVERED], ['todayCases', CASES_TODAY], ['todayDeaths', DEATHS_TODAY], ['casesPerOneMillion', CASES_MILLION], ['deathsPerOneMillion', DEATHS_MILLION]];
const FIELDS_US = [['state', STATE], ['cases', CASES], ['deaths', DEATHS], ['active', ACTIVE], ['todayCases', CASES_TODAY], ['todayDeaths', DEATHS_TODAY]];

class Ncov {
  static async global({
    format = TABLE,
    sortBy = 'cases',
    top = 15,
    fields
  } = {}) {
    return await Acq.tabular({
      title: 'ncov.global',
      url: `${BASE}/countries`,
      prep,
      args: {
        sortBy,
        top,
        fields: FIELDS_GLOBAL
      },
      fields,
      from: TABLE,
      to: format
    });
  }

  static async usa({
    format = TABLE,
    sortBy = 'cases',
    top = 15,
    fields
  } = {}) {
    return await Acq.tabular({
      title: 'ncov.us',
      url: `${BASE}/states`,
      prep,
      args: {
        sortBy,
        top,
        fields: FIELDS_US
      },
      fields,
      from: TABLE,
      to: format
    });
  }

}

const BASE_FIELDS_GLOBAL = [CODE, UPDATED, COUNTRY, CASES, DEATHS, ACTIVE];
const DETAIL_FIELDS_GLOBAL = [RECOVERED, CRITICAL];
const TODAY_FIELDS_GLOBAL = [CASES_TODAY, DEATHS_TODAY];
const RATIO_FIELDS_GLOBAL = [DEATH_RATE, CASES_MILLION, DEATHS_MILLION];
const FIELDS_CHECKBOX_OPTIONS_GLOBAL = [{
  name: 'show ratios',
  checked: true,
  value: RATIO_FIELDS_GLOBAL
}, {
  name: 'show today',
  checked: false,
  value: TODAY_FIELDS_GLOBAL
}, {
  name: 'show details',
  checked: false,
  value: DETAIL_FIELDS_GLOBAL
}];

const BASE_FIELDS_US = [STATE, CASES, DEATHS, ACTIVE];
const RATIO_FIELDS_US = [DEATH_RATE];
const TODAY_FIELDS_US = [CASES_TODAY, DEATHS_TODAY];
const FIELDS_CHECKBOX_OPTIONS_US = [{
  name: 'show ratios',
  checked: true,
  value: RATIO_FIELDS_US
}, {
  name: 'show today',
  checked: false,
  value: TODAY_FIELDS_US
}];

const GLOBAL = 'global',
      USA = 'usa';

const scopeToBaseFields = scope => {
  if (scope === GLOBAL) return BASE_FIELDS_GLOBAL;
  if (scope === USA) return BASE_FIELDS_US;
  return [];
};

const LIST = 'list',
      CHECKBOX = 'checkbox';
const RANGE200 = range(1, 200);
const COLORED_RANGE200 = fluoVector(RANGE200);
const mag = new Mag(0);
class NcovCli {
  static async start() {
    var _ref, _ref4;

    CFonts.say('NCOV update', {
      font: 'simple',
      // define the font face
      background: 'transparent',
      // define the background color, you can also use `backgroundColor` here as key
      space: false,
      // define if the output text should have empty lines on top and on the bottom
      maxLength: 16,
      // define how many character can be on one line
      gradient: [Cards.cyan.accent_3, Cards.pink.lighten_2] // define your two gradient colors

    });
    _ref = '', logger(_ref);
    const {
      scope
    } = await inquirer.prompt([{
      name: 'scope',
      type: LIST,
      default: 0,
      message: 'Do you want to check global or states in the US?',
      choices: [{
        name: 'global',
        value: GLOBAL
      }, {
        name: 'the United States',
        value: USA
      }]
    }]);
    const {
      fields
    } = await inquirer.prompt([{
      name: 'fields',
      type: CHECKBOX,
      message: 'Please (multiple) select additional fields.',
      choices: scope === 'latest' ? FIELDS_CHECKBOX_OPTIONS_GLOBAL : FIELDS_CHECKBOX_OPTIONS_US,

      filter(answers) {
        return Array.prototype.concat.apply(scopeToBaseFields(scope), answers);
      }

    }]);
    const {
      sortBy,
      top,
      format
    } = await inquirer.prompt([{
      name: 'sortBy',
      type: LIST,
      default: 'cases',
      message: 'By what field would you like to sort?',
      choices: fields.map(field => ({
        name: field,
        value: field
      })) // camelToSnake(field, SP)

    }, {
      name: 'top',
      type: LIST,
      default: 29,
      message: 'Narrow down to only top countries?',
      choices: zipper(COLORED_RANGE200, RANGE200, (name, value) => ({
        name,
        value
      }))
    }, {
      name: 'format',
      type: LIST,
      default: TABLE,
      message: 'What tabular format do you prefer?',
      choices: [{
        name: 'table',
        value: TABLE
      }, {
        name: 'samples',
        value: SAMPLES
      }]
    }]);
    const spn = ora(Xr('updating')['sortBy'](sortBy)['top'](top)['timestamp'](now()).toString()).start();
    await Ncov[scope]({
      format,
      sortBy,
      top,
      fields
    }).then(result => {
      var _ref2, _result, _ref3, _result2;

      spn.succeed(Xr('updated')['scope'](scope)['timestamp'](now()).toString());
      if (format === TABLE) _ref2 = (_result = result, DecoTable({
        read: x => typeof x === NUM ? mag.format(x) : decoFlat(x)
      })(_result)), says['corona latest report'](_ref2);
      if (format === SAMPLES) _ref3 = (_result2 = result, decoSamples(_result2)), says['corona latest report'](_ref3);
    });
    _ref4 = '', logger(_ref4);
  }

}

export { NcovCli };
