import { LEFT } from '@analys/enum-join-modes';
import { TABLE } from '@analys/enum-tabular-types';
import { Table } from '@analys/table';
import { Mag } from '@cliche/mag';
import { Cards } from '@palett/cards';
import { fluoVector } from '@palett/fluo-vector';
import { says, decoTable, DecoTable } from '@spare/logger';
import { Xr } from '@spare/xr';
import { time } from '@valjoux/timestamp-pretty';
import { range } from '@vect/vector-init';
import { zipper } from '@vect/vector-zipper';
import CFonts from 'cfonts';
import inquirer from 'inquirer';
import ora from 'ora';
import { CountryTable, Regions, AdminRegions, IncomeLevels, LendingTypes } from '@volks/worldbank-countries';
import { COUNT, INCRE } from '@analys/enum-pivot-mode';
import { tableJoin } from '@analys/table-join';
import { NUM_DESC } from '@aryth/comparer';
import { init, iso, pair } from '@vect/object-init';
import { Acq } from '@acq/acq';
import { samplesToTable } from '@analys/convert';
import { MUTABLE } from '@analys/enum-mutabilities';

const STATE = 'state',
      COUNTRY = 'country',
      COUNTRY_INFO = 'countryInfo',
      CONTINENT = 'continent',
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
const ID = 'id',
      DEATH_RATE = 'death %';

const GLOBAL = 'global',
      USA = 'usa',
      STAT = 'stat';

const countryTable = Table.from(CountryTable).select(['id', 'region', 'capitalCity']);

const BASE_FIELDS_GLOBAL = [ID, UPDATED, COUNTRY, CASES, DEATHS, ACTIVE];
const RATIO_FIELDS_GLOBAL = [DEATH_RATE, CASES_MILLION, DEATHS_MILLION];
const TODAY_FIELDS_GLOBAL = [CASES_TODAY, DEATHS_TODAY];
const DETAIL_FIELDS_GLOBAL = [RECOVERED, CRITICAL];
const REGION_INFO_FIELDS_GLOBAL = [CONTINENT];
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
}, {
  name: 'show region information',
  checked: true,
  value: REGION_INFO_FIELDS_GLOBAL
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

const ADMINREGION = 'adminregion',
      POPULATION = 'population',
      REGION = 'region',
      INCOMELEVEL = 'incomeLevel',
      LENDTYPE = 'lendingType';

const PopulationTable = {
  head: ['id', 'date', 'population'],
  rows: [['ABW', 2019, 106314], ['AFG', 2019, 38041754], ['AGO', 2019, 31825295], ['ALB', 2019, 2854191], ['AND', 2019, 77142], ['ARE', 2019, 9770529], ['ARG', 2019, 44938712], ['ARM', 2019, 2957731], ['ASM', 2019, 55312], ['ATG', 2019, 97118], ['AUS', 2019, 25364307], ['AUT', 2019, 8877067], ['AZE', 2019, 10023318], ['BDI', 2019, 11530580], ['BEL', 2019, 11484055], ['BEN', 2019, 11801151], ['BFA', 2019, 20321378], ['BGD', 2019, 163046161], ['BGR', 2019, 6975761], ['BHR', 2019, 1641172], ['BHS', 2019, 389482], ['BIH', 2019, 3301000], ['BLR', 2019, 9466856], ['BLZ', 2019, 390353], ['BMU', 2019, 63918], ['BOL', 2019, 11513100], ['BRA', 2019, 211049527], ['BRB', 2019, 287025], ['BRN', 2019, 433285], ['BTN', 2019, 763092], ['BWA', 2019, 2303697], ['CAF', 2019, 4745185], ['CAN', 2019, 37589262], ['CHE', 2019, 8574832], ['CHL', 2019, 18952038], ['CHN', 2019, 1397715000], ['CIV', 2019, 25716544], ['CMR', 2019, 25876380], ['COD', 2019, 86790567], ['COG', 2019, 5380508], ['COL', 2019, 50339443], ['COM', 2019, 850886], ['CPV', 2019, 549935], ['CRI', 2019, 5047561], ['CUB', 2019, 11333483], ['CUW', 2019, 157538], ['CYM', 2019, 64948], ['CYP', 2019, 1198575], ['CZE', 2019, 10669709], ['DEU', 2019, 83132799], ['DJI', 2019, 973560], ['DMA', 2019, 71808], ['DNK', 2019, 5818553], ['DOM', 2019, 10738958], ['DZA', 2019, 43053054], ['ECU', 2019, 17373662], ['EGY', 2019, 100388073], ['ERI', 2019, 0], ['ESP', 2019, 47076781], ['EST', 2019, 1326590], ['ETH', 2019, 112078730], ['FIN', 2019, 5520314], ['FJI', 2019, 889953], ['FRA', 2019, 67059887], ['FRO', 2019, 48678], ['FSM', 2019, 113815], ['GAB', 2019, 2172579], ['GBR', 2019, 66834405], ['GEO', 2019, 3720382], ['GHA', 2019, 30417856], ['GIN', 2019, 12771246], ['GMB', 2019, 2347706], ['GNB', 2019, 1920922], ['GNQ', 2019, 1355986], ['GRC', 2019, 10716322], ['GRD', 2019, 112003], ['GRL', 2019, 56225], ['GTM', 2019, 16604026], ['GUM', 2019, 167294], ['GUY', 2019, 782766], ['HND', 2019, 9746117], ['HRV', 2019, 4067500], ['HTI', 2019, 11263077], ['HUN', 2019, 9769949], ['IDN', 2019, 270625568], ['IMN', 2019, 84584], ['IND', 2019, 1366417754], ['IRL', 2019, 4941444], ['IRN', 2019, 82913906], ['IRQ', 2019, 39309783], ['ISL', 2019, 361313], ['ITA', 2019, 60297396], ['JAM', 2019, 2948279], ['JOR', 2019, 10101694], ['JPN', 2019, 126264931], ['KAZ', 2019, 18513930], ['KEN', 2019, 52573973], ['KGZ', 2019, 6456900], ['KHM', 2019, 16486542], ['KIR', 2019, 117606], ['KNA', 2019, 52823], ['KOR', 2019, 51709098], ['KWT', 2019, 4207083], ['LAO', 2019, 7169455], ['LBN', 2019, 6855713], ['LBR', 2019, 4937374], ['LBY', 2019, 6777452], ['LCA', 2019, 182790], ['LIE', 2019, 38019], ['LKA', 2019, 21803000], ['LSO', 2019, 2125268], ['LTU', 2019, 2786844], ['LUX', 2019, 619896], ['LVA', 2019, 1912789], ['MAF', 2019, 38002], ['MAR', 2019, 36471769], ['MCO', 2019, 38964], ['MDA', 2019, 2657637], ['MDG', 2019, 26969307], ['MDV', 2019, 530953], ['MEX', 2019, 127575529], ['MHL', 2019, 58791], ['MKD', 2019, 2083459], ['MLI', 2019, 19658031], ['MLT', 2019, 502653], ['MMR', 2019, 54045420], ['MNE', 2019, 622137], ['MNG', 2019, 3225167], ['MNP', 2019, 57216], ['MOZ', 2019, 30366036], ['MRT', 2019, 4525696], ['MUS', 2019, 1265711], ['MWI', 2019, 18628747], ['MYS', 2019, 31949777], ['NAM', 2019, 2494530], ['NCL', 2019, 287800], ['NER', 2019, 23310715], ['NGA', 2019, 200963599], ['NIC', 2019, 6545502], ['NLD', 2019, 17332850], ['NOR', 2019, 5347896], ['NPL', 2019, 28608710], ['NRU', 2019, 12581], ['NZL', 2019, 4917000], ['OMN', 2019, 4974986], ['PAK', 2019, 216565318], ['PAN', 2019, 4246439], ['PER', 2019, 32510453], ['PHL', 2019, 108116615], ['PLW', 2019, 18008], ['PNG', 2019, 8776109], ['POL', 2019, 37970874], ['PRI', 2019, 3193694], ['PRK', 2019, 25666161], ['PRT', 2019, 10269417], ['PRY', 2019, 7044636], ['PYF', 2019, 279287], ['QAT', 2019, 2832067], ['ROU', 2019, 19356544], ['RUS', 2019, 144373535], ['RWA', 2019, 12626950], ['SAU', 2019, 34268528], ['SDN', 2019, 42813238], ['SEN', 2019, 16296364], ['SGP', 2019, 5703569], ['SLB', 2019, 669823], ['SLE', 2019, 7813215], ['SLV', 2019, 6453553], ['SMR', 2019, 33860], ['SOM', 2019, 15442905], ['SRB', 2019, 6944975], ['SSD', 2019, 11062113], ['STP', 2019, 215056], ['SUR', 2019, 581372], ['SVK', 2019, 5454073], ['SVN', 2019, 2087946], ['SWE', 2019, 10285453], ['SWZ', 2019, 1148130], ['SXM', 2019, 40733], ['SYC', 2019, 97625], ['SYR', 2019, 17070135], ['TCA', 2019, 38191], ['TCD', 2019, 15946876], ['TGO', 2019, 8082366], ['THA', 2019, 69625582], ['TJK', 2019, 9321018], ['TKM', 2019, 5942089], ['TLS', 2019, 1293119], ['TON', 2019, 104494], ['TTO', 2019, 1394973], ['TUN', 2019, 11694719], ['TUR', 2019, 83429615], ['TUV', 2019, 11646], ['TZA', 2019, 58005463], ['UGA', 2019, 44269594], ['UKR', 2019, 44385155], ['URY', 2019, 3461734], ['USA', 2019, 328239523], ['UZB', 2019, 33580650], ['VCT', 2019, 110589], ['VEN', 2019, 28515829], ['VGB', 2019, 30030], ['VIR', 2019, 106631], ['VNM', 2019, 96462106], ['VUT', 2019, 299882], ['WSM', 2019, 197097], ['XKX', 2019, 1794248], ['YEM', 2019, 29161922], ['ZAF', 2019, 58558270], ['ZMB', 2019, 17861030], ['ZWE', 2019, 14645468]]
};

const ConsolidatedCountryTable = tableJoin(CountryTable, PopulationTable, [ID], LEFT);

const GroupLabels = init([[REGION, Regions], [ADMINREGION, AdminRegions], [INCOMELEVEL, IncomeLevels], [LENDTYPE, LendingTypes]]);
const groupedStat = async (table, {
  groupBy = REGION,
  sortBy = CASES,
  restFields = []
} = {}) => {
  table = Table.from(tableJoin(table, ConsolidatedCountryTable, [ID], LEFT)).group({
    key: groupBy,
    field: {
      country: COUNT,
      cases: INCRE,
      deaths: INCRE,
      population: INCRE,
      ...iso(restFields, INCRE)
    },
    filter: pair(groupBy, x => !!x)
  }).formula(init([[CASES_MILLION, (cases, population) => (cases / population * 1E+6).toFixed(2)], [DEATHS_MILLION, (deaths, population) => (deaths / population * 1E+6).toFixed(2)], [DEATH_RATE, (cases, deaths) => (deaths / cases * 100).toFixed(2)]]));
  if (groupBy in GroupLabels) table.mutateColumn(groupBy, x => GroupLabels[groupBy][x]);
  if (sortBy) table.sort(sortBy, NUM_DESC);
  return table;
};

const FIELDS_GLOBAL = [['updated', UPDATED], ['country', COUNTRY], ['countryInfo', COUNTRY_INFO], ['continent', CONTINENT], ['cases', CASES], ['deaths', DEATHS], ['active', ACTIVE], ['critical', CRITICAL], ['recovered', RECOVERED], ['todayCases', CASES_TODAY], ['todayDeaths', DEATHS_TODAY], ['casesPerOneMillion', CASES_MILLION], ['deathsPerOneMillion', DEATHS_MILLION]];
const FIELDS_US = [['state', STATE], ['cases', CASES], ['deaths', DEATHS], ['active', ACTIVE], ['todayCases', CASES_TODAY], ['todayDeaths', DEATHS_TODAY]];

// export const BASE = 'https://corona.lmao.ninja/v2'
const BASE = 'https://disease.sh/v3/covid-19';

const prep = function (samples, {
  sortBy,
  top,
  fields
}) {
  const table = Table.from(samplesToTable(samples, fields)).pushColumn(DEATH_RATE, samples.map(s => {
    var _ref;

    return (_ref = s[DEATHS] / s[CASES] * 100) === null || _ref === void 0 ? void 0 : _ref.toFixed(2);
  }));
  if (table.head.includes(COUNTRY_INFO)) table.unshiftColumn(ID, samples.map(getCountryIso)).deleteColumn([COUNTRY_INFO], MUTABLE);
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

class Ncov {
  static async global({
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
      to: TABLE
    });
  }

  static async usa({
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
      to: TABLE
    });
  }

}

const scopeToBaseFields = scope => {
  if (scope === GLOBAL) return BASE_FIELDS_GLOBAL;
  if (scope === USA) return BASE_FIELDS_US;
  return [];
};

const LIST = 'list',
      CHECKBOX = 'checkbox';
const RANGE200 = range(1, 200);
const COLORED_RANGE200 = fluoVector(RANGE200);
new Mag(0);
const logger = says['ncov-cli'].attach(time);
class NcovCli {
  static async start() {
    var _ref, _ref10;

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
    } = await inquirer.prompt({
      name: 'scope',
      type: LIST,
      default: 0,
      message: 'Do you want to check global, states in the US, or general statistics?',
      choices: [{
        name: 'global',
        value: GLOBAL
      }, {
        name: 'the United States',
        value: USA
      }, {
        name: 'general statistics',
        value: STAT
      }]
    });

    if (scope === STAT) {
      var _ref2, _ref3, _await$groupedStat, _ref4, _ref5, _await$groupedStat2, _ref6, _ref7, _await$groupedStat3, _ref8;

      const spn = ora(Xr('updating').timestamp(time()).toString()).start();
      const table = await Ncov.global({
        top: 0
      });
      spn.succeed(Xr('updated').scope(scope).timestamp(time()).toString());
      const {
        fields
      } = await inquirer.prompt([{
        name: 'fields',
        type: CHECKBOX,
        message: 'Please (multiple) select additional fields.',
        choices: [{
          name: 'show today',
          checked: false,
          value: TODAY_FIELDS_GLOBAL
        }, {
          name: 'show details',
          checked: false,
          value: DETAIL_FIELDS_GLOBAL
        }],

        filter(answers) {
          return [].concat(...answers);
        }

      }]);
      const {
        sortBy
      } = await inquirer.prompt([{
        name: 'sortBy',
        type: LIST,
        default: 'cases',
        message: 'By what field would you like to sort?',
        choices: [COUNTRY, CASES, DEATHS, POPULATION, CASES_MILLION, DEATHS_MILLION, DEATH_RATE].concat(fields)
      }]);
      _ref2 = '', logger(_ref2);
      _ref3 = (_await$groupedStat = await groupedStat(table, {
        groupBy: REGION,
        sortBy,
        restFields: fields
      }), decoTable(_await$groupedStat)), says[REGION](_ref3);
      _ref4 = '', logger(_ref4);
      _ref5 = (_await$groupedStat2 = await groupedStat(table, {
        groupBy: INCOMELEVEL,
        sortBy,
        restFields: fields
      }), decoTable(_await$groupedStat2)), says[INCOMELEVEL](_ref5);
      _ref6 = '', logger(_ref6);
      _ref7 = (_await$groupedStat3 = await groupedStat(table, {
        groupBy: ADMINREGION,
        sortBy,
        restFields: fields
      }), decoTable(_await$groupedStat3)), says[ADMINREGION](_ref7);
      _ref8 = '', logger(_ref8);
      return void 0;
    }

    const {
      fields
    } = await inquirer.prompt({
      name: 'fields',
      type: CHECKBOX,
      message: 'Please (multiple) select additional fields.',
      choices: scope === GLOBAL ? FIELDS_CHECKBOX_OPTIONS_GLOBAL : FIELDS_CHECKBOX_OPTIONS_US,

      filter(answers) {
        return scopeToBaseFields(scope).concat(...answers);
      }

    });
    const {
      sortBy
    } = await inquirer.prompt({
      name: 'sortBy',
      type: LIST,
      default: fields.indexOf(CASES),
      message: 'By what field would you like to sort?',
      choices: fields.map(field => ({
        name: field,
        value: field
      })) // camelToSnake(field, SP)

    });
    const {
      top
    } = await inquirer.prompt({
      name: 'top',
      type: LIST,
      default: 79,
      message: 'Narrow down to only top CountryTable?',
      choices: zipper(COLORED_RANGE200, RANGE200, (name, value) => ({
        name,
        value
      }))
    });
    const spn = ora(Xr('ncov-cli').p(time()).p('updating').sortBy(sortBy).top(top).toString()).start();
    await Ncov[scope]({
      format: TABLE,
      sortBy,
      top,
      fields
    }).then(table => {
      var _ref9, _table;

      spn.succeed(Xr('ncov-cli').p(time()).p('updated').scope(scope).toString());
      if (scope === GLOBAL) table = Table.from(table).join(countryTable, ['id'], LEFT);
      _ref9 = (_table = table, DecoTable()(_table) // { read: x => typeof x === NUM ? mag.format(x) : decoFlat(x) }
      ), logger.br(scope)(_ref9);
    });
    _ref10 = '', logger(_ref10);
  }

}

export { NcovCli };
