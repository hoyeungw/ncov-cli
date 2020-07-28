import { TABLE, SAMPLES } from '@analys/enum-tabular-types';
import { Mag } from '@cliche/mag';
import { Cards } from '@palett/cards';
import { fluoVector } from '@palett/fluo-vector';
import { decoFlat } from '@spare/deco-flat';
import { logger, decoTable, says, DecoTable, decoSamples } from '@spare/logger';
import { Xr } from '@spare/xr';
import { NUM } from '@typen/enum-data-types';
import { now } from '@valjoux/timestamp';
import { range } from '@vect/vector-init';
import { zipper } from '@vect/vector-zipper';
import CFonts from 'cfonts';
import inquirer from 'inquirer';
import ora from 'ora';
import { LEFT as LEFT$1 } from '@analys/enum-join-modes';
import { INCRE, COUNT } from '@analys/enum-pivot-mode';
import { Table } from '@analys/table';
import { tableJoin, LEFT } from '@analys/table-join';
import { NUM_DESC } from '@aryth/comparer';
import { init, iso, pair } from '@vect/object-init';
import { Acq } from '@acq/acq';
import { samplesToTable } from '@analys/convert';
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
const ID = 'id',
      DEATH_RATE = 'death %';

const GLOBAL = 'global',
      USA = 'usa',
      STAT = 'stat';

const BASE_FIELDS_GLOBAL = [ID, UPDATED, COUNTRY, CASES, DEATHS, ACTIVE];
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

const ADMINREGION = 'adminregion',
      POPULATION = 'population',
      REGION = 'region',
      INCOMELEVEL = 'incomeLevel',
      LENDTYPE = 'lendingType';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

const AdminRegions = {
  SAS: 'South Asia',
  SSA: 'Sub-Saharan Africa (excluding high income)',
  ECA: 'Europe & Central Asia (excluding high income)',
  LAC: 'Latin America & Caribbean (excluding high income)',
  EAP: 'East Asia & Pacific (excluding high income)',
  MNA: 'Middle East & North Africa (excluding high income)'
};

const IncomeLevels = {
  HIC: 'High income',
  LIC: 'Low income',
  LMC: 'Lower middle income',
  UMC: 'Upper middle income'
};

const LendingTypes = {
  LNX: 'Not classified',
  IDX: 'IDA',
  IBD: 'IBRD',
  IDB: 'Blend'
};

const Regions = {
  LCN: 'Latin America & Caribbean',
  SAS: 'South Asia',
  SSF: 'Sub-Saharan Africa',
  ECS: 'Europe & Central Asia',
  MEA: 'Middle East & North Africa',
  EAS: 'East Asia & Pacific',
  NAC: 'North America'
};

const countries = {
  head: ['id', 'iso2Code', 'name', 'region', 'adminregion', 'incomeLevel', 'lendingType', 'capitalCity', 'longitude', 'latitude'],
  rows: [['ABW', 'AW', 'Aruba', 'LCN', null, 'HIC', 'LNX', 'Oranjestad', -70.0167, 12.5167], ['AFG', 'AF', 'Afghanistan', 'SAS', 'SAS', 'LIC', 'IDX', 'Kabul', 69.1761, 34.5228], ['AGO', 'AO', 'Angola', 'SSF', 'SSA', 'LMC', 'IBD', 'Luanda', 13.242, -8.81155], ['ALB', 'AL', 'Albania', 'ECS', 'ECA', 'UMC', 'IBD', 'Tirane', 19.8172, 41.3317], ['AND', 'AD', 'Andorra', 'ECS', null, 'HIC', 'LNX', 'Andorra la Vella', 1.5218, 42.5075], ['ARE', 'AE', 'United Arab Emirates', 'MEA', null, 'HIC', 'LNX', 'Abu Dhabi', 54.3705, 24.4764], ['ARG', 'AR', 'Argentina', 'LCN', 'LAC', 'UMC', 'IBD', 'Buenos Aires', -58.4173, -34.6118], ['ARM', 'AM', 'Armenia', 'ECS', 'ECA', 'UMC', 'IBD', 'Yerevan', 44.509, 40.1596], ['ASM', 'AS', 'American Samoa', 'EAS', 'EAP', 'UMC', 'LNX', 'Pago Pago', -170.691, -14.2846], ['ATG', 'AG', 'Antigua and Barbuda', 'LCN', null, 'HIC', 'IBD', 'Saint John\'s', -61.8456, 17.1175], ['AUS', 'AU', 'Australia', 'EAS', null, 'HIC', 'LNX', 'Canberra', 149.129, -35.282], ['AUT', 'AT', 'Austria', 'ECS', null, 'HIC', 'LNX', 'Vienna', 16.3798, 48.2201], ['AZE', 'AZ', 'Azerbaijan', 'ECS', 'ECA', 'UMC', 'IBD', 'Baku', 49.8932, 40.3834], ['BDI', 'BI', 'Burundi', 'SSF', 'SSA', 'LIC', 'IDX', 'Bujumbura', 29.3639, -3.3784], ['BEL', 'BE', 'Belgium', 'ECS', null, 'HIC', 'LNX', 'Brussels', 4.36761, 50.8371], ['BEN', 'BJ', 'Benin', 'SSF', 'SSA', 'LIC', 'IDX', 'Porto-Novo', 2.6323, 6.4779], ['BFA', 'BF', 'Burkina Faso', 'SSF', 'SSA', 'LIC', 'IDX', 'Ouagadougou', -1.53395, 12.3605], ['BGD', 'BD', 'Bangladesh', 'SAS', 'SAS', 'LMC', 'IDX', 'Dhaka', 90.4113, 23.7055], ['BGR', 'BG', 'Bulgaria', 'ECS', 'ECA', 'UMC', 'IBD', 'Sofia', 23.3238, 42.7105], ['BHR', 'BH', 'Bahrain', 'MEA', null, 'HIC', 'LNX', 'Manama', 50.5354, 26.1921], ['BHS', 'BS', 'Bahamas, The', 'LCN', null, 'HIC', 'LNX', 'Nassau', -77.339, 25.0661], ['BIH', 'BA', 'Bosnia and Herzegovina', 'ECS', 'ECA', 'UMC', 'IBD', 'Sarajevo', 18.4214, 43.8607], ['BLR', 'BY', 'Belarus', 'ECS', 'ECA', 'UMC', 'IBD', 'Minsk', 27.5766, 53.9678], ['BLZ', 'BZ', 'Belize', 'LCN', 'LAC', 'UMC', 'IBD', 'Belmopan', -88.7713, 17.2534], ['BMU', 'BM', 'Bermuda', 'NAC', null, 'HIC', 'LNX', 'Hamilton', -64.706, 32.3293], ['BOL', 'BO', 'Bolivia', 'LCN', 'LAC', 'LMC', 'IBD', 'La Paz', -66.1936, -13.9908], ['BRA', 'BR', 'Brazil', 'LCN', 'LAC', 'UMC', 'IBD', 'Brasilia', -47.9292, -15.7801], ['BRB', 'BB', 'Barbados', 'LCN', null, 'HIC', 'LNX', 'Bridgetown', -59.6105, 13.0935], ['BRN', 'BN', 'Brunei Darussalam', 'EAS', null, 'HIC', 'LNX', 'Bandar Seri Begawan', 114.946, 4.94199], ['BTN', 'BT', 'Bhutan', 'SAS', 'SAS', 'LMC', 'IDX', 'Thimphu', 89.6177, 27.5768], ['BWA', 'BW', 'Botswana', 'SSF', 'SSA', 'UMC', 'IBD', 'Gaborone', 25.9201, -24.6544], ['CAF', 'CF', 'Central African Republic', 'SSF', 'SSA', 'LIC', 'IDX', 'Bangui', 21.6407, 5.63056], ['CAN', 'CA', 'Canada', 'NAC', null, 'HIC', 'LNX', 'Ottawa', -75.6919, 45.4215], ['CHE', 'CH', 'Switzerland', 'ECS', null, 'HIC', 'LNX', 'Bern', 7.44821, 46.948], ['CHL', 'CL', 'Chile', 'LCN', null, 'HIC', 'IBD', 'Santiago', -70.6475, -33.475], ['CHN', 'CN', 'China', 'EAS', 'EAP', 'UMC', 'IBD', 'Beijing', 116.286, 40.0495], ['CIV', 'CI', 'Cote d\'Ivoire', 'SSF', 'SSA', 'LMC', 'IDX', 'Yamoussoukro', -4.0305, 5.332], ['CMR', 'CM', 'Cameroon', 'SSF', 'SSA', 'LMC', 'IDB', 'Yaounde', 11.5174, 3.8721], ['COD', 'CD', 'Congo, Dem. Rep.', 'SSF', 'SSA', 'LIC', 'IDX', 'Kinshasa', 15.3222, -4.325], ['COG', 'CG', 'Congo, Rep.', 'SSF', 'SSA', 'LMC', 'IDB', 'Brazzaville', 15.2662, -4.2767], ['COL', 'CO', 'Colombia', 'LCN', 'LAC', 'UMC', 'IBD', 'Bogota', -74.082, 4.60987], ['COM', 'KM', 'Comoros', 'SSF', 'SSA', 'LMC', 'IDX', 'Moroni', 43.2418, -11.6986], ['CPV', 'CV', 'Cabo Verde', 'SSF', 'SSA', 'LMC', 'IDB', 'Praia', -23.5087, 14.9218], ['CRI', 'CR', 'Costa Rica', 'LCN', 'LAC', 'UMC', 'IBD', 'San Jose', -84.0089, 9.63701], ['CUB', 'CU', 'Cuba', 'LCN', 'LAC', 'UMC', 'LNX', 'Havana', -82.3667, 23.1333], ['CUW', 'CW', 'Curacao', 'LCN', null, 'HIC', 'LNX', 'Willemstad', null, null], ['CYM', 'KY', 'Cayman Islands', 'LCN', null, 'HIC', 'LNX', 'George Town', -81.3857, 19.3022], ['CYP', 'CY', 'Cyprus', 'ECS', null, 'HIC', 'LNX', 'Nicosia', 33.3736, 35.1676], ['CZE', 'CZ', 'Czech Republic', 'ECS', null, 'HIC', 'LNX', 'Prague', 14.4205, 50.0878], ['DEU', 'DE', 'Germany', 'ECS', null, 'HIC', 'LNX', 'Berlin', 13.4115, 52.5235], ['DJI', 'DJ', 'Djibouti', 'MEA', 'MNA', 'LMC', 'IDX', 'Djibouti', 43.1425, 11.5806], ['DMA', 'DM', 'Dominica', 'LCN', 'LAC', 'UMC', 'IDB', 'Roseau', -61.39, 15.2976], ['DNK', 'DK', 'Denmark', 'ECS', null, 'HIC', 'LNX', 'Copenhagen', 12.5681, 55.6763], ['DOM', 'DO', 'Dominican Republic', 'LCN', 'LAC', 'UMC', 'IBD', 'Santo Domingo', -69.8908, 18.479], ['DZA', 'DZ', 'Algeria', 'MEA', 'MNA', 'UMC', 'IBD', 'Algiers', 3.05097, 36.7397], ['ECU', 'EC', 'Ecuador', 'LCN', 'LAC', 'UMC', 'IBD', 'Quito', -78.5243, -0.229498], ['EGY', 'EG', 'Egypt, Arab Rep.', 'MEA', 'MNA', 'LMC', 'IBD', 'Cairo', 31.2461, 30.0982], ['ERI', 'ER', 'Eritrea', 'SSF', 'SSA', 'LIC', 'IDX', 'Asmara', 38.9183, 15.3315], ['ESP', 'ES', 'Spain', 'ECS', null, 'HIC', 'LNX', 'Madrid', -3.70327, 40.4167], ['EST', 'EE', 'Estonia', 'ECS', null, 'HIC', 'LNX', 'Tallinn', 24.7586, 59.4392], ['ETH', 'ET', 'Ethiopia', 'SSF', 'SSA', 'LIC', 'IDX', 'Addis Ababa', 38.7468, 9.02274], ['FIN', 'FI', 'Finland', 'ECS', null, 'HIC', 'LNX', 'Helsinki', 24.9525, 60.1608], ['FJI', 'FJ', 'Fiji', 'EAS', 'EAP', 'UMC', 'IDB', 'Suva', 178.399, -18.1149], ['FRA', 'FR', 'France', 'ECS', null, 'HIC', 'LNX', 'Paris', 2.35097, 48.8566], ['FRO', 'FO', 'Faroe Islands', 'ECS', null, 'HIC', 'LNX', 'Torshavn', -6.91181, 61.8926], ['FSM', 'FM', 'Micronesia, Fed. Sts.', 'EAS', 'EAP', 'LMC', 'IDX', 'Palikir', 158.185, 6.91771], ['GAB', 'GA', 'Gabon', 'SSF', 'SSA', 'UMC', 'IBD', 'Libreville', 9.45162, 0.38832], ['GBR', 'GB', 'United Kingdom', 'ECS', null, 'HIC', 'LNX', 'London', -0.126236, 51.5002], ['GEO', 'GE', 'Georgia', 'ECS', 'ECA', 'UMC', 'IBD', 'Tbilisi', 44.793, 41.71], ['GHA', 'GH', 'Ghana', 'SSF', 'SSA', 'LMC', 'IDX', 'Accra', -0.20795, 5.57045], ['GIN', 'GN', 'Guinea', 'SSF', 'SSA', 'LIC', 'IDX', 'Conakry', -13.7, 9.51667], ['GMB', 'GM', 'Gambia, The', 'SSF', 'SSA', 'LIC', 'IDX', 'Banjul', -16.5885, 13.4495], ['GNB', 'GW', 'Guinea-Bissau', 'SSF', 'SSA', 'LIC', 'IDX', 'Bissau', -15.1804, 11.8037], ['GNQ', 'GQ', 'Equatorial Guinea', 'SSF', 'SSA', 'UMC', 'IBD', 'Malabo', 8.7741, 3.7523], ['GRC', 'GR', 'Greece', 'ECS', null, 'HIC', 'LNX', 'Athens', 23.7166, 37.9792], ['GRD', 'GD', 'Grenada', 'LCN', 'LAC', 'UMC', 'IDB', 'Saint George\'s', -61.7449, 12.0653], ['GRL', 'GL', 'Greenland', 'ECS', null, 'HIC', 'LNX', 'Nuuk', -51.7214, 64.1836], ['GTM', 'GT', 'Guatemala', 'LCN', 'LAC', 'UMC', 'IBD', 'Guatemala City', -90.5328, 14.6248], ['GUM', 'GU', 'Guam', 'EAS', null, 'HIC', 'LNX', 'Agana', 144.794, 13.4443], ['GUY', 'GY', 'Guyana', 'LCN', 'LAC', 'UMC', 'IDX', 'Georgetown', -58.1548, 6.80461], ['HND', 'HN', 'Honduras', 'LCN', 'LAC', 'LMC', 'IDX', 'Tegucigalpa', -87.4667, 15.1333], ['HRV', 'HR', 'Croatia', 'ECS', null, 'HIC', 'IBD', 'Zagreb', 15.9614, 45.8069], ['HTI', 'HT', 'Haiti', 'LCN', 'LAC', 'LIC', 'IDX', 'Port-au-Prince', -72.3288, 18.5392], ['HUN', 'HU', 'Hungary', 'ECS', null, 'HIC', 'LNX', 'Budapest', 19.0408, 47.4984], ['IDN', 'ID', 'Indonesia', 'EAS', 'EAP', 'LMC', 'IBD', 'Jakarta', 106.83, -6.19752], ['IMN', 'IM', 'Isle of Man', 'ECS', null, 'HIC', 'LNX', 'Douglas', -4.47928, 54.1509], ['IND', 'IN', 'India', 'SAS', 'SAS', 'LMC', 'IBD', 'New Delhi', 77.225, 28.6353], ['IRL', 'IE', 'Ireland', 'ECS', null, 'HIC', 'LNX', 'Dublin', -6.26749, 53.3441], ['IRN', 'IR', 'Iran, Islamic Rep.', 'MEA', 'MNA', 'UMC', 'IBD', 'Tehran', 51.4447, 35.6878], ['IRQ', 'IQ', 'Iraq', 'MEA', 'MNA', 'UMC', 'IBD', 'Baghdad', 44.394, 33.3302], ['ISL', 'IS', 'Iceland', 'ECS', null, 'HIC', 'LNX', 'Reykjavik', -21.8952, 64.1353], ['ITA', 'IT', 'Italy', 'ECS', null, 'HIC', 'LNX', 'Rome', 12.4823, 41.8955], ['JAM', 'JM', 'Jamaica', 'LCN', 'LAC', 'UMC', 'IBD', 'Kingston', -76.792, 17.9927], ['JOR', 'JO', 'Jordan', 'MEA', 'MNA', 'UMC', 'IBD', 'Amman', 35.9263, 31.9497], ['JPN', 'JP', 'Japan', 'EAS', null, 'HIC', 'LNX', 'Tokyo', 139.77, 35.67], ['KAZ', 'KZ', 'Kazakhstan', 'ECS', 'ECA', 'UMC', 'IBD', 'Astana', 71.4382, 51.1879], ['KEN', 'KE', 'Kenya', 'SSF', 'SSA', 'LMC', 'IDB', 'Nairobi', 36.8126, -1.27975], ['KGZ', 'KG', 'Kyrgyz Republic', 'ECS', 'ECA', 'LMC', 'IDX', 'Bishkek', 74.6057, 42.8851], ['KHM', 'KH', 'Cambodia', 'EAS', 'EAP', 'LMC', 'IDX', 'Phnom Penh', 104.874, 11.5556], ['KIR', 'KI', 'Kiribati', 'EAS', 'EAP', 'LMC', 'IDX', 'Tarawa', 172.979, 1.32905], ['KNA', 'KN', 'St. Kitts and Nevis', 'LCN', null, 'HIC', 'IBD', 'Basseterre', -62.7309, 17.3], ['KOR', 'KR', 'Korea, Rep.', 'EAS', null, 'HIC', 'LNX', 'Seoul', 126.957, 37.5323], ['KWT', 'KW', 'Kuwait', 'MEA', null, 'HIC', 'LNX', 'Kuwait City', 47.9824, 29.3721], ['LAO', 'LA', 'Lao PDR', 'EAS', 'EAP', 'LMC', 'IDX', 'Vientiane', 102.177, 18.5826], ['LBN', 'LB', 'Lebanon', 'MEA', 'MNA', 'UMC', 'IBD', 'Beirut', 35.5134, 33.8872], ['LBR', 'LR', 'Liberia', 'SSF', 'SSA', 'LIC', 'IDX', 'Monrovia', -10.7957, 6.30039], ['LBY', 'LY', 'Libya', 'MEA', 'MNA', 'UMC', 'IBD', 'Tripoli', 13.1072, 32.8578], ['LCA', 'LC', 'St. Lucia', 'LCN', 'LAC', 'UMC', 'IDB', 'Castries', -60.9832, 14], ['LIE', 'LI', 'Liechtenstein', 'ECS', null, 'HIC', 'LNX', 'Vaduz', 9.52148, 47.1411], ['LKA', 'LK', 'Sri Lanka', 'SAS', 'SAS', 'UMC', 'IBD', 'Colombo', 79.8528, 6.92148], ['LSO', 'LS', 'Lesotho', 'SSF', 'SSA', 'LMC', 'IDX', 'Maseru', 27.7167, -29.5208], ['LTU', 'LT', 'Lithuania', 'ECS', null, 'HIC', 'LNX', 'Vilnius', 25.2799, 54.6896], ['LUX', 'LU', 'Luxembourg', 'ECS', null, 'HIC', 'LNX', 'Luxembourg', 6.1296, 49.61], ['LVA', 'LV', 'Latvia', 'ECS', null, 'HIC', 'LNX', 'Riga', 24.1048, 56.9465], ['MAF', 'MF', 'St. Martin (French part)', 'LCN', null, 'HIC', 'LNX', 'Marigot', null, null], ['MAR', 'MA', 'Morocco', 'MEA', 'MNA', 'LMC', 'IBD', 'Rabat', -6.8704, 33.9905], ['MCO', 'MC', 'Monaco', 'ECS', null, 'HIC', 'LNX', 'Monaco', 7.41891, 43.7325], ['MDA', 'MD', 'Moldova', 'ECS', 'ECA', 'LMC', 'IDB', 'Chisinau', 28.8497, 47.0167], ['MDG', 'MG', 'Madagascar', 'SSF', 'SSA', 'LIC', 'IDX', 'Antananarivo', 45.7167, -20.4667], ['MDV', 'MV', 'Maldives', 'SAS', 'SAS', 'UMC', 'IDX', 'Male', 73.5109, 4.1742], ['MEX', 'MX', 'Mexico', 'LCN', 'LAC', 'UMC', 'IBD', 'Mexico City', -99.1276, 19.427], ['MHL', 'MH', 'Marshall Islands', 'EAS', 'EAP', 'UMC', 'IDX', 'Majuro', 171.135, 7.11046], ['MKD', 'MK', 'North Macedonia', 'ECS', 'ECA', 'UMC', 'IBD', 'Skopje', 21.4361, 42.0024], ['MLI', 'ML', 'Mali', 'SSF', 'SSA', 'LIC', 'IDX', 'Bamako', -7.50034, 13.5667], ['MLT', 'MT', 'Malta', 'MEA', null, 'HIC', 'LNX', 'Valletta', 14.5189, 35.9042], ['MMR', 'MM', 'Myanmar', 'EAS', 'EAP', 'LMC', 'IDX', 'Naypyidaw', 95.9562, 21.914], ['MNE', 'ME', 'Montenegro', 'ECS', 'ECA', 'UMC', 'IBD', 'Podgorica', 19.2595, 42.4602], ['MNG', 'MN', 'Mongolia', 'EAS', 'EAP', 'LMC', 'IDB', 'Ulaanbaatar', 106.937, 47.9129], ['MNP', 'MP', 'Northern Mariana Islands', 'EAS', null, 'HIC', 'LNX', 'Saipan', 145.765, 15.1935], ['MOZ', 'MZ', 'Mozambique', 'SSF', 'SSA', 'LIC', 'IDX', 'Maputo', 32.5713, -25.9664], ['MRT', 'MR', 'Mauritania', 'SSF', 'SSA', 'LMC', 'IDX', 'Nouakchott', -15.9824, 18.2367], ['MUS', 'MU', 'Mauritius', 'SSF', 'SSA', 'UMC', 'IBD', 'Port Louis', 57.4977, -20.1605], ['MWI', 'MW', 'Malawi', 'SSF', 'SSA', 'LIC', 'IDX', 'Lilongwe', 33.7703, -13.9899], ['MYS', 'MY', 'Malaysia', 'EAS', 'EAP', 'UMC', 'IBD', 'Kuala Lumpur', 101.684, 3.12433], ['NAM', 'NA', 'Namibia', 'SSF', 'SSA', 'UMC', 'IBD', 'Windhoek', 17.0931, -22.5648], ['NCL', 'NC', 'New Caledonia', 'EAS', null, 'HIC', 'LNX', 'Noum\'ea', 166.464, -22.2677], ['NER', 'NE', 'Niger', 'SSF', 'SSA', 'LIC', 'IDX', 'Niamey', 2.1073, 13.514], ['NGA', 'NG', 'Nigeria', 'SSF', 'SSA', 'LMC', 'IDB', 'Abuja', 7.48906, 9.05804], ['NIC', 'NI', 'Nicaragua', 'LCN', 'LAC', 'LMC', 'IDX', 'Managua', -86.2734, 12.1475], ['NLD', 'NL', 'Netherlands', 'ECS', null, 'HIC', 'LNX', 'Amsterdam', 4.89095, 52.3738], ['NOR', 'NO', 'Norway', 'ECS', null, 'HIC', 'LNX', 'Oslo', 10.7387, 59.9138], ['NPL', 'NP', 'Nepal', 'SAS', 'SAS', 'LIC', 'IDX', 'Kathmandu', 85.3157, 27.6939], ['NRU', 'NR', 'Nauru', 'EAS', 'EAP', 'UMC', 'IBD', 'Yaren District', 166.920867, -0.5477], ['NZL', 'NZ', 'New Zealand', 'EAS', null, 'HIC', 'LNX', 'Wellington', 174.776, -41.2865], ['OMN', 'OM', 'Oman', 'MEA', null, 'HIC', 'LNX', 'Muscat', 58.5874, 23.6105], ['PAK', 'PK', 'Pakistan', 'SAS', 'SAS', 'LMC', 'IDB', 'Islamabad', 72.8, 30.5167], ['PAN', 'PA', 'Panama', 'LCN', null, 'HIC', 'IBD', 'Panama City', -79.5188, 8.99427], ['PER', 'PE', 'Peru', 'LCN', 'LAC', 'UMC', 'IBD', 'Lima', -77.0465, -12.0931], ['PHL', 'PH', 'Philippines', 'EAS', 'EAP', 'LMC', 'IBD', 'Manila', 121.035, 14.5515], ['PLW', 'PW', 'Palau', 'EAS', null, 'HIC', 'IBD', 'Koror', 134.479, 7.34194], ['PNG', 'PG', 'Papua New Guinea', 'EAS', 'EAP', 'LMC', 'IDB', 'Port Moresby', 147.194, -9.47357], ['POL', 'PL', 'Poland', 'ECS', null, 'HIC', 'IBD', 'Warsaw', 21.02, 52.26], ['PRI', 'PR', 'Puerto Rico', 'LCN', null, 'HIC', 'LNX', 'San Juan', -66, 18.23], ['PRK', 'KP', 'Korea, Dem. People’s Rep.', 'EAS', 'EAP', 'LIC', 'LNX', 'Pyongyang', 125.754, 39.0319], ['PRT', 'PT', 'Portugal', 'ECS', null, 'HIC', 'LNX', 'Lisbon', -9.13552, 38.7072], ['PRY', 'PY', 'Paraguay', 'LCN', 'LAC', 'UMC', 'IBD', 'Asuncion', -57.6362, -25.3005], ['PYF', 'PF', 'French Polynesia', 'EAS', null, 'HIC', 'LNX', 'Papeete', -149.57, -17.535], ['QAT', 'QA', 'Qatar', 'MEA', null, 'HIC', 'LNX', 'Doha', 51.5082, 25.2948], ['ROU', 'RO', 'Romania', 'ECS', 'ECA', 'UMC', 'IBD', 'Bucharest', 26.0979, 44.4479], ['RUS', 'RU', 'Russian Federation', 'ECS', 'ECA', 'UMC', 'IBD', 'Moscow', 37.6176, 55.7558], ['RWA', 'RW', 'Rwanda', 'SSF', 'SSA', 'LIC', 'IDX', 'Kigali', 30.0587, -1.95325], ['SAU', 'SA', 'Saudi Arabia', 'MEA', null, 'HIC', 'LNX', 'Riyadh', 46.6977, 24.6748], ['SDN', 'SD', 'Sudan', 'SSF', 'SSA', 'LMC', 'IDX', 'Khartoum', 32.5363, 15.5932], ['SEN', 'SN', 'Senegal', 'SSF', 'SSA', 'LMC', 'IDX', 'Dakar', -17.4734, 14.7247], ['SGP', 'SG', 'Singapore', 'EAS', null, 'HIC', 'LNX', 'Singapore', 103.85, 1.28941], ['SLB', 'SB', 'Solomon Islands', 'EAS', 'EAP', 'LMC', 'IDX', 'Honiara', 159.949, -9.42676], ['SLE', 'SL', 'Sierra Leone', 'SSF', 'SSA', 'LIC', 'IDX', 'Freetown', -13.2134, 8.4821], ['SLV', 'SV', 'El Salvador', 'LCN', 'LAC', 'LMC', 'IBD', 'San Salvador', -89.2073, 13.7034], ['SMR', 'SM', 'San Marino', 'ECS', null, 'HIC', 'LNX', 'San Marino', 12.4486, 43.9322], ['SOM', 'SO', 'Somalia', 'SSF', 'SSA', 'LIC', 'IDX', 'Mogadishu', 45.3254, 2.07515], ['SRB', 'RS', 'Serbia', 'ECS', 'ECA', 'UMC', 'IBD', 'Belgrade', 20.4656, 44.8024], ['SSD', 'SS', 'South Sudan', 'SSF', 'SSA', 'LIC', 'IDX', 'Juba', 31.6, 4.85], ['STP', 'ST', 'Sao Tome and Principe', 'SSF', 'SSA', 'LMC', 'IDX', 'Sao Tome', 6.6071, 0.20618], ['SUR', 'SR', 'Suriname', 'LCN', 'LAC', 'UMC', 'IBD', 'Paramaribo', -55.1679, 5.8232], ['SVK', 'SK', 'Slovak Republic', 'ECS', null, 'HIC', 'LNX', 'Bratislava', 17.1073, 48.1484], ['SVN', 'SI', 'Slovenia', 'ECS', null, 'HIC', 'LNX', 'Ljubljana', 14.5044, 46.0546], ['SWE', 'SE', 'Sweden', 'ECS', null, 'HIC', 'LNX', 'Stockholm', 18.0645, 59.3327], ['SWZ', 'SZ', 'Eswatini', 'SSF', 'SSA', 'LMC', 'IBD', 'Mbabane', 31.4659, -26.5225], ['SXM', 'SX', 'Sint Maarten (Dutch part)', 'LCN', null, 'HIC', 'LNX', 'Philipsburg', null, null], ['SYC', 'SC', 'Seychelles', 'SSF', null, 'HIC', 'IBD', 'Victoria', 55.4466, -4.6309], ['SYR', 'SY', 'Syrian Arab Republic', 'MEA', 'MNA', 'LIC', 'IDX', 'Damascus', 36.3119, 33.5146], ['TCA', 'TC', 'Turks and Caicos Islands', 'LCN', null, 'HIC', 'LNX', 'Grand Turk', -71.141389, 21.4602778], ['TCD', 'TD', 'Chad', 'SSF', 'SSA', 'LIC', 'IDX', 'N\'Djamena', 15.0445, 12.1048], ['TGO', 'TG', 'Togo', 'SSF', 'SSA', 'LIC', 'IDX', 'Lome', 1.2255, 6.1228], ['THA', 'TH', 'Thailand', 'EAS', 'EAP', 'UMC', 'IBD', 'Bangkok', 100.521, 13.7308], ['TJK', 'TJ', 'Tajikistan', 'ECS', 'ECA', 'LIC', 'IDX', 'Dushanbe', 68.7864, 38.5878], ['TKM', 'TM', 'Turkmenistan', 'ECS', 'ECA', 'UMC', 'IBD', 'Ashgabat', 58.3794, 37.9509], ['TLS', 'TL', 'Timor-Leste', 'EAS', 'EAP', 'LMC', 'IDB', 'Dili', 125.567, -8.56667], ['TON', 'TO', 'Tonga', 'EAS', 'EAP', 'UMC', 'IDX', 'Nuku\'alofa', -175.216, -21.136], ['TTO', 'TT', 'Trinidad and Tobago', 'LCN', null, 'HIC', 'IBD', 'Port-of-Spain', -61.4789, 10.6596], ['TUN', 'TN', 'Tunisia', 'MEA', 'MNA', 'LMC', 'IBD', 'Tunis', 10.21, 36.7899], ['TUR', 'TR', 'Turkey', 'ECS', 'ECA', 'UMC', 'IBD', 'Ankara', 32.3606, 39.7153], ['TUV', 'TV', 'Tuvalu', 'EAS', 'EAP', 'UMC', 'IDX', 'Funafuti', 179.089567, -8.6314877], ['TZA', 'TZ', 'Tanzania', 'SSF', 'SSA', 'LIC', 'IDX', 'Dodoma', 35.7382, -6.17486], ['UGA', 'UG', 'Uganda', 'SSF', 'SSA', 'LIC', 'IDX', 'Kampala', 32.5729, 0.314269], ['UKR', 'UA', 'Ukraine', 'ECS', 'ECA', 'LMC', 'IBD', 'Kiev', 30.5038, 50.4536], ['URY', 'UY', 'Uruguay', 'LCN', null, 'HIC', 'IBD', 'Montevideo', -56.0675, -34.8941], ['USA', 'US', 'United States', 'NAC', null, 'HIC', 'LNX', 'Washington D.C.', -77.032, 38.8895], ['UZB', 'UZ', 'Uzbekistan', 'ECS', 'ECA', 'LMC', 'IDB', 'Tashkent', 69.269, 41.3052], ['VCT', 'VC', 'St. Vincent and the Grenadines', 'LCN', 'LAC', 'UMC', 'IDB', 'Kingstown', -61.2653, 13.2035], ['VEN', 'VE', 'Venezuela, RB', 'LCN', 'LAC', 'UMC', 'IBD', 'Caracas', -69.8371, 9.08165], ['VGB', 'VG', 'British Virgin Islands', 'LCN', null, 'HIC', 'LNX', 'Road Town', -64.623056, 18.431389], ['VIR', 'VI', 'Virgin Islands (U.S.)', 'LCN', null, 'HIC', 'LNX', 'Charlotte Amalie', -64.8963, 18.3358], ['VNM', 'VN', 'Vietnam', 'EAS', 'EAP', 'LMC', 'IBD', 'Hanoi', 105.825, 21.0069], ['VUT', 'VU', 'Vanuatu', 'EAS', 'EAP', 'LMC', 'IDX', 'Port-Vila', 168.321, -17.7404], ['WSM', 'WS', 'Samoa', 'EAS', 'EAP', 'UMC', 'IDX', 'Apia', -171.752, -13.8314], ['XKX', 'XK', 'Kosovo', 'ECS', 'ECA', 'UMC', 'IDX', 'Pristina', 20.926, 42.565], ['YEM', 'YE', 'Yemen, Rep.', 'MEA', 'MNA', 'LIC', 'IDX', 'Sana\'a', 44.2075, 15.352], ['ZAF', 'ZA', 'South Africa', 'SSF', 'SSA', 'UMC', 'IBD', 'Pretoria', 28.1871, -25.746], ['ZMB', 'ZM', 'Zambia', 'SSF', 'SSA', 'LMC', 'IDX', 'Lusaka', 28.2937, -15.3982], ['ZWE', 'ZW', 'Zimbabwe', 'SSF', 'SSA', 'LMC', 'IDB', 'Harare', 31.0672, -17.8312]]
};

const populations = {
  head: ['id', 'date', 'population'],
  rows: [['ABW', 2019, 106314], ['AFG', 2019, 38041754], ['AGO', 2019, 31825295], ['ALB', 2019, 2854191], ['AND', 2019, 77142], ['ARE', 2019, 9770529], ['ARG', 2019, 44938712], ['ARM', 2019, 2957731], ['ASM', 2019, 55312], ['ATG', 2019, 97118], ['AUS', 2019, 25364307], ['AUT', 2019, 8877067], ['AZE', 2019, 10023318], ['BDI', 2019, 11530580], ['BEL', 2019, 11484055], ['BEN', 2019, 11801151], ['BFA', 2019, 20321378], ['BGD', 2019, 163046161], ['BGR', 2019, 6975761], ['BHR', 2019, 1641172], ['BHS', 2019, 389482], ['BIH', 2019, 3301000], ['BLR', 2019, 9466856], ['BLZ', 2019, 390353], ['BMU', 2019, 63918], ['BOL', 2019, 11513100], ['BRA', 2019, 211049527], ['BRB', 2019, 287025], ['BRN', 2019, 433285], ['BTN', 2019, 763092], ['BWA', 2019, 2303697], ['CAF', 2019, 4745185], ['CAN', 2019, 37589262], ['CHE', 2019, 8574832], ['CHL', 2019, 18952038], ['CHN', 2019, 1397715000], ['CIV', 2019, 25716544], ['CMR', 2019, 25876380], ['COD', 2019, 86790567], ['COG', 2019, 5380508], ['COL', 2019, 50339443], ['COM', 2019, 850886], ['CPV', 2019, 549935], ['CRI', 2019, 5047561], ['CUB', 2019, 11333483], ['CUW', 2019, 157538], ['CYM', 2019, 64948], ['CYP', 2019, 1198575], ['CZE', 2019, 10669709], ['DEU', 2019, 83132799], ['DJI', 2019, 973560], ['DMA', 2019, 71808], ['DNK', 2019, 5818553], ['DOM', 2019, 10738958], ['DZA', 2019, 43053054], ['ECU', 2019, 17373662], ['EGY', 2019, 100388073], ['ERI', 2019, 0], ['ESP', 2019, 47076781], ['EST', 2019, 1326590], ['ETH', 2019, 112078730], ['FIN', 2019, 5520314], ['FJI', 2019, 889953], ['FRA', 2019, 67059887], ['FRO', 2019, 48678], ['FSM', 2019, 113815], ['GAB', 2019, 2172579], ['GBR', 2019, 66834405], ['GEO', 2019, 3720382], ['GHA', 2019, 30417856], ['GIN', 2019, 12771246], ['GMB', 2019, 2347706], ['GNB', 2019, 1920922], ['GNQ', 2019, 1355986], ['GRC', 2019, 10716322], ['GRD', 2019, 112003], ['GRL', 2019, 56225], ['GTM', 2019, 16604026], ['GUM', 2019, 167294], ['GUY', 2019, 782766], ['HND', 2019, 9746117], ['HRV', 2019, 4067500], ['HTI', 2019, 11263077], ['HUN', 2019, 9769949], ['IDN', 2019, 270625568], ['IMN', 2019, 84584], ['IND', 2019, 1366417754], ['IRL', 2019, 4941444], ['IRN', 2019, 82913906], ['IRQ', 2019, 39309783], ['ISL', 2019, 361313], ['ITA', 2019, 60297396], ['JAM', 2019, 2948279], ['JOR', 2019, 10101694], ['JPN', 2019, 126264931], ['KAZ', 2019, 18513930], ['KEN', 2019, 52573973], ['KGZ', 2019, 6456900], ['KHM', 2019, 16486542], ['KIR', 2019, 117606], ['KNA', 2019, 52823], ['KOR', 2019, 51709098], ['KWT', 2019, 4207083], ['LAO', 2019, 7169455], ['LBN', 2019, 6855713], ['LBR', 2019, 4937374], ['LBY', 2019, 6777452], ['LCA', 2019, 182790], ['LIE', 2019, 38019], ['LKA', 2019, 21803000], ['LSO', 2019, 2125268], ['LTU', 2019, 2786844], ['LUX', 2019, 619896], ['LVA', 2019, 1912789], ['MAF', 2019, 38002], ['MAR', 2019, 36471769], ['MCO', 2019, 38964], ['MDA', 2019, 2657637], ['MDG', 2019, 26969307], ['MDV', 2019, 530953], ['MEX', 2019, 127575529], ['MHL', 2019, 58791], ['MKD', 2019, 2083459], ['MLI', 2019, 19658031], ['MLT', 2019, 502653], ['MMR', 2019, 54045420], ['MNE', 2019, 622137], ['MNG', 2019, 3225167], ['MNP', 2019, 57216], ['MOZ', 2019, 30366036], ['MRT', 2019, 4525696], ['MUS', 2019, 1265711], ['MWI', 2019, 18628747], ['MYS', 2019, 31949777], ['NAM', 2019, 2494530], ['NCL', 2019, 287800], ['NER', 2019, 23310715], ['NGA', 2019, 200963599], ['NIC', 2019, 6545502], ['NLD', 2019, 17332850], ['NOR', 2019, 5347896], ['NPL', 2019, 28608710], ['NRU', 2019, 12581], ['NZL', 2019, 4917000], ['OMN', 2019, 4974986], ['PAK', 2019, 216565318], ['PAN', 2019, 4246439], ['PER', 2019, 32510453], ['PHL', 2019, 108116615], ['PLW', 2019, 18008], ['PNG', 2019, 8776109], ['POL', 2019, 37970874], ['PRI', 2019, 3193694], ['PRK', 2019, 25666161], ['PRT', 2019, 10269417], ['PRY', 2019, 7044636], ['PYF', 2019, 279287], ['QAT', 2019, 2832067], ['ROU', 2019, 19356544], ['RUS', 2019, 144373535], ['RWA', 2019, 12626950], ['SAU', 2019, 34268528], ['SDN', 2019, 42813238], ['SEN', 2019, 16296364], ['SGP', 2019, 5703569], ['SLB', 2019, 669823], ['SLE', 2019, 7813215], ['SLV', 2019, 6453553], ['SMR', 2019, 33860], ['SOM', 2019, 15442905], ['SRB', 2019, 6944975], ['SSD', 2019, 11062113], ['STP', 2019, 215056], ['SUR', 2019, 581372], ['SVK', 2019, 5454073], ['SVN', 2019, 2087946], ['SWE', 2019, 10285453], ['SWZ', 2019, 1148130], ['SXM', 2019, 40733], ['SYC', 2019, 97625], ['SYR', 2019, 17070135], ['TCA', 2019, 38191], ['TCD', 2019, 15946876], ['TGO', 2019, 8082366], ['THA', 2019, 69625582], ['TJK', 2019, 9321018], ['TKM', 2019, 5942089], ['TLS', 2019, 1293119], ['TON', 2019, 104494], ['TTO', 2019, 1394973], ['TUN', 2019, 11694719], ['TUR', 2019, 83429615], ['TUV', 2019, 11646], ['TZA', 2019, 58005463], ['UGA', 2019, 44269594], ['UKR', 2019, 44385155], ['URY', 2019, 3461734], ['USA', 2019, 328239523], ['UZB', 2019, 33580650], ['VCT', 2019, 110589], ['VEN', 2019, 28515829], ['VGB', 2019, 30030], ['VIR', 2019, 106631], ['VNM', 2019, 96462106], ['VUT', 2019, 299882], ['WSM', 2019, 197097], ['XKX', 2019, 1794248], ['YEM', 2019, 29161922], ['ZAF', 2019, 58558270], ['ZMB', 2019, 17861030], ['ZWE', 2019, 14645468]]
};

const c12ns = tableJoin(countries, populations, [ID], LEFT); // c12ns |> decoTable |> logger

const GroupLabels = init([[REGION, Regions], [ADMINREGION, AdminRegions], [INCOMELEVEL, IncomeLevels], [LENDTYPE, LendingTypes]]);
const groupedStat = async (table, {
  groupBy = REGION,
  sortBy = CASES,
  restFields = []
} = {}) => {
  table = Table.from(tableJoin(table, c12ns, [ID], LEFT$1)).group({
    key: groupBy,
    field: _objectSpread2({
      country: COUNT,
      cases: INCRE,
      deaths: INCRE,
      population: INCRE
    }, iso(restFields, INCRE)),
    filter: pair(groupBy, x => !!x)
  }).formula(init([[CASES_MILLION, (cases, population) => (cases / population * 1E+6).toFixed(2)], [DEATHS_MILLION, (deaths, population) => (deaths / population * 1E+6).toFixed(2)], [DEATH_RATE, (cases, deaths) => (deaths / cases * 100).toFixed(2)]]));
  if (groupBy in GroupLabels) table.mutateColumn(groupBy, x => GroupLabels[groupBy][x]);
  if (sortBy) table.sort(sortBy, NUM_DESC);
  return table;
};

const prep = function (samples, {
  sortBy,
  top,
  fields
}) {
  const table = Table.from(samplesToTable(samples, fields)).pushColumn(DEATH_RATE, samples.map(s => {
    var _ref;

    return (_ref = s[DEATHS] / s[CASES] * 100) === null || _ref === void 0 ? void 0 : _ref.toFixed(2);
  }));
  if (table.head.includes(COUNTRY_INFO)) table.unshiftColumn(ID, samples.map(getCountryIso)).spliceColumns([COUNTRY_INFO], MUTABLE);
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

const BASE = 'https://corona.lmao.ninja/v2';

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
    var _ref, _ref11;

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
    }]);

    if (scope === STAT) {
      var _ref2, _ref3, _await$groupedStat, _ref4, _ref5, _await$groupedStat2, _ref6, _ref7, _await$groupedStat3, _ref8;

      const spn = ora(Xr('updating')['timestamp'](now()).toString()).start();
      const table = await Ncov.global({
        top: 0
      });
      spn.succeed(Xr('updated')['scope'](scope)['timestamp'](now()).toString());
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
    } = await inquirer.prompt([{
      name: 'fields',
      type: CHECKBOX,
      message: 'Please (multiple) select additional fields.',
      choices: scope === GLOBAL ? FIELDS_CHECKBOX_OPTIONS_GLOBAL : FIELDS_CHECKBOX_OPTIONS_US,

      filter(answers) {
        return scopeToBaseFields(scope).concat(...answers);
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
      var _ref9, _result, _ref10, _result2;

      spn.succeed(Xr('updated')['scope'](scope)['timestamp'](now()).toString());
      if (format === TABLE) _ref9 = (_result = result, DecoTable({
        read: x => typeof x === NUM ? mag.format(x) : decoFlat(x)
      })(_result)), says['corona latest report'].br(scope)(_ref9);
      if (format === SAMPLES) _ref10 = (_result2 = result, decoSamples(_result2)), says['corona latest report'](_ref10);
    });
    _ref11 = '', logger(_ref11);
  }

}

export { NcovCli };
