'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var CFonts = _interopDefault(require('cfonts'));
var inquirer = _interopDefault(require('inquirer'));
var ora = _interopDefault(require('ora'));
var cards = require('@palett/cards');
var enumTabularTypes = require('@analys/enum-tabular-types');
var logger = require('@spare/logger');
var vectorInit = require('@vect/vector-init');
var fluoVector = require('@palett/fluo-vector');
var vectorZipper = require('@vect/vector-zipper');
var xr = require('@spare/xr');
var timestamp = require('@valjoux/timestamp');
var mag$1 = require('@cliche/mag');
var enumDataTypes = require('@typen/enum-data-types');
var decoFlat = require('@spare/deco-flat');
var acq = require('@acq/acq');
var table = require('@analys/table');
var convert = require('@analys/convert');
var comparer = require('@aryth/comparer');
var enumMutabilities = require('@analys/enum-mutabilities');

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
  const table$1 = table.Table.from(convert.samplesToTable(samples, fields)).pushColumn(DEATH_RATE, samples.map(s => {
    var _ref;

    return (_ref = s[DEATHS] / s[CASES] * 100) === null || _ref === void 0 ? void 0 : _ref.toFixed(2);
  }));
  if (table$1.head.includes(COUNTRY_INFO)) table$1.unshiftColumn(CODE, samples.map(getCountryIso)).spliceColumns([COUNTRY_INFO], enumMutabilities.MUTABLE);
  if (table$1.head.includes(UPDATED)) table$1.mutateColumn(UPDATED, x => new Date(x));
  if (table$1.head.includes(DEATHS_MILLION)) table$1.mutateColumn(DEATHS_MILLION, x => x === null || x === void 0 ? void 0 : x.toFixed(2));
  if (table$1.head.includes(sortBy)) table$1.sort(sortBy, comparer.NUM_DESC, enumMutabilities.MUTABLE);
  if (top) table$1.rows.splice(top);
  return table$1;
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
    format = enumTabularTypes.TABLE,
    sortBy = 'cases',
    top = 15,
    fields
  } = {}) {
    return await acq.Acq.tabular({
      title: 'ncov.global',
      url: `${BASE}/countries`,
      prep,
      args: {
        sortBy,
        top,
        fields: FIELDS_GLOBAL
      },
      fields,
      from: enumTabularTypes.TABLE,
      to: format
    });
  }

  static async usa({
    format = enumTabularTypes.TABLE,
    sortBy = 'cases',
    top = 15,
    fields
  } = {}) {
    return await acq.Acq.tabular({
      title: 'ncov.us',
      url: `${BASE}/states`,
      prep,
      args: {
        sortBy,
        top,
        fields: FIELDS_US
      },
      fields,
      from: enumTabularTypes.TABLE,
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
const RANGE200 = vectorInit.range(1, 200);
const COLORED_RANGE200 = fluoVector.fluoVector(RANGE200);
const mag = new mag$1.Mag(0);
class NcovCli {
  static async start() {
    var _ref;

    CFonts.say('NCOV update', {
      font: 'simple',
      // define the font face
      background: 'transparent',
      // define the background color, you can also use `backgroundColor` here as key
      space: false,
      // define if the output text should have empty lines on top and on the bottom
      maxLength: 16,
      // define how many character can be on one line
      gradient: [cards.Cards.cyan.accent_3, cards.Cards.pink.lighten_2] // define your two gradient colors

    });
    _ref = '', logger.logger(_ref);
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
      choices: vectorZipper.zipper(COLORED_RANGE200, RANGE200, (name, value) => ({
        name,
        value
      }))
    }, {
      name: 'format',
      type: LIST,
      default: enumTabularTypes.TABLE,
      message: 'What tabular format do you prefer?',
      choices: [{
        name: 'table',
        value: enumTabularTypes.TABLE
      }, {
        name: 'samples',
        value: enumTabularTypes.SAMPLES
      }]
    }]);
    const spn = ora(xr.Xr('updating')['sortBy'](sortBy)['top'](top)['timestamp'](timestamp.now()).toString()).start();
    await Ncov[scope]({
      format,
      sortBy,
      top,
      fields
    }).then(result => {
      var _ref2, _result, _ref3, _result2;

      spn.succeed(xr.Xr('updated')['scope'](scope)['timestamp'](timestamp.now()).toString());
      if (format === enumTabularTypes.TABLE) _ref2 = (_result = result, logger.DecoTable({
        read: x => typeof x === enumDataTypes.NUM ? mag.format(x) : decoFlat.decoFlat(x)
      })(_result)), logger.says['corona latest report'](_ref2);
      if (format === enumTabularTypes.SAMPLES) _ref3 = (_result2 = result, logger.decoSamples(_result2)), logger.says['corona latest report'](_ref3);
    });
  }

}

exports.NcovCli = NcovCli;
