"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var iso639_3_json_1 = __importDefault(require("iso639-js/reference/iso639-3.json"));
var alpha2to3mapping_json_1 = __importDefault(require("iso639-js/alpha2to3mapping.json"));
var iso639_3_macrolanguages_json_1 = __importDefault(require("iso639-js/reference/iso639-3-macrolanguages.json"));
var iso639part2CodeLookup = {};
var iso639part2LanguageLookup = {};
/**
 * Process the ISO 693-2 macro languages to populate the lookup table.
 */
Object.keys(iso639_3_macrolanguages_json_1.default).forEach(function (macro) {
    // Get the individual scope languages for the specified macro key.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var individuals = (iso639_3_macrolanguages_json_1.default[macro] || [])
        .map(function (obj) { return Object.keys(obj)[0]; });
    // Combine macro code + found individual codes.
    var relatedCodes6393 = [macro].concat(individuals);
    // Convert to 639-2B.
    var relatedCodes6392 = relatedCodes6393.filter(function (code) {
        var _a;
        if (Object.prototype.hasOwnProperty.call(iso639_3_json_1.default, code)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (_a = (iso639_3_json_1.default[code] || [])) === null || _a === void 0 ? void 0 : _a.part2B;
        }
        return null;
    });
    // Assign the same array to the macro and all its individuals.
    relatedCodes6392.forEach(function (code) {
        iso639part2CodeLookup[code.toLowerCase()] = relatedCodes6392;
    });
});
/**
 * Process the ISO 693-2 languages that do not contain a macro language definition,
 * And then populate the language lookup table with the known macro language table values.
 */
Object.keys(iso639_3_json_1.default).forEach(function (code) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _a = iso639_3_json_1.default[code] || [], part2B = _a.part2B, part2T = _a.part2T;
    var part2Codes = [];
    if (part2B) {
        part2Codes.push(part2B);
    }
    if (part2T && part2T !== part2B) {
        part2Codes.push(part2T);
    }
    part2Codes.forEach(function (part2Code) {
        if (part2Code && !Object.prototype.hasOwnProperty.call(iso639part2CodeLookup, part2Code.toLowerCase())) {
            iso639part2CodeLookup[part2Code.toLowerCase()] = part2Codes;
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var referenceName = (iso639_3_json_1.default[code] || []).referenceName;
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
var getISO639part2Languages = function (codeOrName) {
    var key = (codeOrName || '').trim().toLowerCase();
    if (!key) {
        return [];
    }
    if (key.length === 2) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        key = alpha2to3mapping_json_1.default[key] || key;
    }
    return iso639part2CodeLookup[key] || iso639part2LanguageLookup[key];
};
exports.default = getISO639part2Languages;
exports.getISO639part2Languages = getISO639part2Languages;
