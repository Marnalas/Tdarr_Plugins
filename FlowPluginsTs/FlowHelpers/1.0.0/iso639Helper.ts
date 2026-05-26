import iso639part3Data from 'iso639-js/reference/iso639-3.json';
import alpha2to3mapping from 'iso639-js/alpha2to3mapping.json';
import iso639part3MacroLanguages from 'iso639-js/reference/iso639-3-macrolanguages.json';

const iso639part2CodeLookup: Record<string, string[]> = {};
const iso639part2LanguageLookup: Record<string, string[]> = {};

/**
 * Process the ISO 693-2 macro languages to populate the lookup table.
 */
Object.keys(iso639part3MacroLanguages).forEach((macro) => {
  // Get the individual scope languages for the specified macro key.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const individuals: string[] = ((iso639part3MacroLanguages as any)[macro] || [])
    .map((obj: string) => Object.keys(obj)[0]);
  // Combine macro code + found individual codes.
  const relatedCodes6393 = [macro].concat(individuals);
  // Convert to 639-2B.
  const relatedCodes6392 = relatedCodes6393.filter((code) => {
    if (Object.prototype.hasOwnProperty.call(iso639part3Data, code)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((iso639part3Data as any)[code] || [])?.part2B;
    }
    return null;
  });
  // Assign the same array to the macro and all its individuals.
  relatedCodes6392.forEach((code: string) => {
    iso639part2CodeLookup[code.toLowerCase()] = relatedCodes6392;
  });
});

/**
 * Process the ISO 693-2 languages that do not contain a macro language definition,
 * And then populate the language lookup table with the known macro language table values.
 */
Object.keys(iso639part3Data).forEach((code) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { part2B, part2T } = (iso639part3Data as any)[code] || [];
  const part2Codes: string[] = [];
  if (part2B) {
    part2Codes.push(part2B);
  }
  if (part2T && part2T !== part2B) {
    part2Codes.push(part2T);
  }
  part2Codes.forEach((part2Code) => {
    if (part2Code && !Object.prototype.hasOwnProperty.call(iso639part2CodeLookup, part2Code.toLowerCase())) {
      iso639part2CodeLookup[part2Code.toLowerCase()] = part2Codes;
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { referenceName } = (iso639part3Data as any)[code] || [];
  if ((part2B || part2T) && referenceName) {
    iso639part2LanguageLookup[referenceName.toLowerCase()] = iso639part2CodeLookup[part2B || part2T];
  }
});

/**
 * Helper function to get the primary and all associated ISO 639-2 language codes
 * from an alpha2 language code (e.g. "no"),
 * or an alpha3 language code (e.g. "kor"),
 * or the language name in English (e.g. "swedish")
 * @example
 * getISO639part2Languages("Norwegian") // result: ['nor', 'nno', 'nob']
 * getISO639part2Languages("nno") // result: ['nor', 'nno', 'nob']
 * getISO639part2Languages("nor") // result: ['nor', 'nno', 'nob']
 * // 'nor' is the macro language in ISO 639-2,
 * // 'nno' and 'nob' are individual scoped languages that relate to 'nor'.
 * getISO639part2Languages("Swedish") // result: ['swe']
 * // 'swe' has no associated languages so it will only return the individual-scoped ISO639-2 language code.
 */
const getISO639part2Languages = (codeOrName: string):string[] => {
  let key = (codeOrName || '').trim().toLowerCase();
  if (!key) {
    return [];
  }
  if (key.length === 2) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    key = (alpha2to3mapping as any)[key] || key;
  }
  return iso639part2CodeLookup[key] || iso639part2LanguageLookup[key];
};
export default getISO639part2Languages;
exports.getISO639part2Languages = getISO639part2Languages;
