import { makeReplaceable } from '@spare/translator'

const DICT = [
  [/\bSaint\b/g, 'St.'],
  [/\band(?:\sthe)?\b/g, '&'],
  [/Jamahiriya/g, 'Jam.'],
  [/\s*\(.*\)\s*/g, '']
] |> makeReplaceable

const simplify = tx => {
  const reg = /(?:People's|Democratic|Republic)\s*/gi
  const ms = tx.match(reg), hi = ms?.length ?? 0
  if (hi <= 0) { return tx }
  if (hi === 1) { return tx.replace(reg, wd => wd.slice(0, 3) + '.') }
  if (hi >= 2) { return tx.replace(reg, wd => wd.charAt(0) + '.') }
}

export const renameCountry = tx => simplify(tx).replace(DICT)