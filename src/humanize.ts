/**
 * Copyright 2013-2016 HubSpotDev
 * MIT Licensed
 *
 * @module humanize.ts
 */

// This file is intentionally authored as a TypeScript *script* (not an ES
// module) so that the hand-written UMD wrapper below is emitted verbatim and
// the original runtime behavior (CommonJS + AMD + browser global) is
// preserved exactly.

interface HumanizeStatic {
  /**
   * DEPRECATED: Use compactInteger instead
   * Converts a large integer to a friendly text representation.
   */
  intword(number: number | string, charWidth?: unknown, decimals?: number): string;

  /**
   * Converts an integer to its most compact representation
   */
  compactInteger(input: number | string, decimals?: number): string;

  /**
   * Converts an integer into its most compact representation
   */
  intComma(number: number | string, decimals?: number): string;

  /** Alias for intComma */
  intcomma(number: number | string, decimals?: number): string;

  /**
   * Formats the value like a 'human-readable' file size (i.e. '13 KB', '4.1 MB', '102 bytes', etc).
   */
  fileSize(filesize: number, precision?: number): string;

  /** Alias for fileSize */
  filesize(filesize: number, precision?: number): string;

  /**
   * Formats a number to a human-readable string.
   * Localize by overriding the precision, thousand and decimal arguments.
   */
  formatNumber(number: number, precision?: number, thousand?: string, decimal?: string): string;

  /**
   * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
   * problems for accounting and finance-related software.
   */
  toFixed(value: number, precision?: number): string;

  /**
   * Ensures precision value is a positive integer.
   */
  normalizePrecision(value: number | undefined, base?: number): number;

  /**
   * Converts an integer to its ordinal as a string.
   */
  ordinal(value: number | string): number | string;

  /**
   * Interprets numbers as occurences. Also accepts an optional array/map of overrides.
   */
  times(value: number | string, overrides?: { [digit: number]: string }): string | null;

  /**
   * Returns the plural version of a given word if the value is not 1. The default
   * suffix is 's'.
   */
  pluralize(number?: number | string | null, singular?: string | null, plural?: string): string | null;

  /**
   * Truncates a string if it is longer than the specified number of characters.
   * Truncated strings will end with a translatable ellipsis sequence ("…").
   */
  truncate(str: string, length?: number, ending?: string): string;

  /**
   * Truncates a string after a certain number of words.
   */
  truncateWords(string: string, length: number): string | null;

  /** Alias for truncateWords */
  truncatewords(string: string, length: number): string | null;

  /**
   * Truncates a number to an upper bound.
   */
  boundedNumber(num: number | string, bound?: number, ending?: string): string;

  /** Alias for boundedNumber */
  truncatenumber(num: number | string, bound?: number, ending?: string): string;

  /**
   * Converts a list of items to a human readable string with an optional limit.
   */
  oxford(items: any[], limit?: number, limitStr?: string): string;

  /**
   * Describes how many times an item appears in a list
   */
  frequency(list: any, verb: string): string | null;

  /**
   * Converts an object to a definition-like string
   */
  dictionary(object: any, joiner?: string, separator?: string): string;

  /**
   * Matches a pace (value and interval) with a logical time frame. Very useful
   * for slow paces.
   */
  pace(value: number, intervalMs: number, unit?: string): string;

  /**
   * Converts newlines to <br/> tags
   */
  nl2br(string: string, replacement?: string): string;

  /**
   * Converts <br/> tags to newlines
   */
  br2nl(string: string, replacement?: string): string;

  /**
   * Capitalizes the first letter in a string, optionally downcasing the tail
   */
  capitalize(string: string, downCaseTail?: boolean): string;

  /**
   * Capitalizes the first letter of each word in a string
   */
  capitalizeAll(string: string): string;

  /**
   * Titlecase words in a string.
   */
  titleCase(string: string): string;

  /** Alias for titleCase */
  titlecase(string: string): string;
}

declare const define: any;

((root: any, factory: () => HumanizeStatic) => {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], () => (root.Humanize = factory()));
  } else {
    root.Humanize = factory();
  }
})(this, (): HumanizeStatic => {

  const TIME_FORMATS = [
    {
      name: 'second',
      value: 1e3
    },
    {
      name: 'minute',
      value: 6e4
    },
    {
      name: 'hour',
      value: 36e5
    },
    {
      name: 'day',
      value: 864e5
    },
    {
      name: 'week',
      value: 6048e5
    }
  ];

  const LABELS_FOR_POWERS_OF_KILO: { [label: string]: number } = {
    P: Math.pow(2, 50),
    T: Math.pow(2, 40),
    G: Math.pow(2, 30),
    M: Math.pow(2, 20)
  };

  const exists = (maybe: unknown): boolean => typeof maybe !== 'undefined' && maybe !== null;

  const isNaN = (value: unknown): boolean => value !== value;

  const isFiniteNumber = (value: unknown): boolean => isFinite(value as number) && !isNaN(parseFloat(value as string));

  const isArray = (value: unknown): boolean => Object.prototype.toString.call(value) === '[object Array]';

  const Humanize: HumanizeStatic = {
    // DEPRECATED: Use compactInteger instead
    intword(number: number | string, charWidth?: unknown, decimals: number = 2): string {
      /*
       * This method is deprecated. Please use compactInteger instead.
       * intword will be going away in the next major version.
       */
      return Humanize.compactInteger(number, decimals);
    },

    // Converts an integer to its most compact representation
    compactInteger(input: number | string, decimals: number = 0): string {
      decimals = Math.max(decimals, 0);
      const number = parseInt(input as string, 10);
      const signString = number < 0 ? '-' : '';
      const unsignedNumber = Math.abs(number);
      const unsignedNumberString = String(unsignedNumber);
      const numberLength = unsignedNumberString.length;
      const numberLengths = [13, 10, 7, 4];
      const bigNumPrefixes = ['T', 'B', 'M', 'k'];

      // small numbers
      if (unsignedNumber < 1000) {
        return `${signString}${unsignedNumberString}`;
      }

      // really big numbers
      if (numberLength > numberLengths[0] + 3) {
        return number.toExponential(decimals).replace('e+', 'x10^');
      }

      // 999 < unsignedNumber < 999,999,999,999,999
      let length: number | undefined;
      for (let i = 0; i < numberLengths.length; i++) {
        const _length = numberLengths[i];
        if (numberLength >= _length) {
          length = _length;
          break;
        }
      }

      const decimalIndex = numberLength - length! + 1;
      const unsignedNumberCharacterArray = unsignedNumberString.split('');

      const wholePartArray = unsignedNumberCharacterArray.slice(0, decimalIndex);
      const decimalPartArray = unsignedNumberCharacterArray.slice(decimalIndex, decimalIndex + decimals + 1);

      const wholePart = wholePartArray.join('');

      // pad decimalPart if necessary
      let decimalPart = decimalPartArray.join('');
      if (decimalPart.length < decimals) {
        decimalPart += `${Array(decimals - decimalPart.length + 1).join('0')}`;
      }

      let output;
      if (decimals === 0) {
        output = `${signString}${wholePart}${bigNumPrefixes[numberLengths.indexOf(length!)]}`;
      } else {
        const outputNumber = Number(`${wholePart}.${decimalPart}`).toFixed(decimals);
        output = `${signString}${outputNumber}${bigNumPrefixes[numberLengths.indexOf(length!)]}`;
      }

      return output;
    },

    // Converts an integer into its most compact representation
    intComma(number: number | string, decimals: number = 0): string {
      return Humanize.formatNumber(number as number, decimals);
    },

    intcomma(...args: Parameters<HumanizeStatic['intComma']>): string {
      return Humanize.intComma(...args);
    },

    // Formats the value like a 'human-readable' file size (i.e. '13 KB', '4.1 MB', '102 bytes', etc).
    fileSize(filesize: number, precision: number = 2): string {
      for (const label in LABELS_FOR_POWERS_OF_KILO) {
        if (LABELS_FOR_POWERS_OF_KILO.hasOwnProperty(label)) {
          const minnum = LABELS_FOR_POWERS_OF_KILO[label];
          if (filesize >= minnum) {
            return `${Humanize.formatNumber(filesize / minnum, precision, '')} ${label}B`;
          }
        }
      }
      if (filesize >= 1024) {
        return `${Humanize.formatNumber(filesize / 1024, 0)} KB`;
      }
      return `${Humanize.formatNumber(filesize, 0)}${Humanize.pluralize(filesize, ' byte')}`;
    },

    filesize(...args: Parameters<HumanizeStatic['fileSize']>): string {
      return Humanize.fileSize(...args);
    },

    // Formats a number to a human-readable string.
    // Localize by overriding the precision, thousand and decimal arguments.
    formatNumber(number: number, precision: number = 0, thousand: string = ',', decimal: string = '.'): string {
      // Create some private utility functions to make the computational
      // code that follows much easier to read.

      const firstComma = (_number: string, _thousand: string, _position: number): string => {
        return _position ? _number.substr(0, _position) + _thousand : '';
      };

      const commas = (_number: string, _thousand: string, _position: number): string => {
        return _number.substr(_position).replace(/(\d{3})(?=\d)/g, `$1${_thousand}`);
      };

      const decimals = (_number: number, _decimal: string, usePrecision: number): string => {
        return usePrecision
          ? _decimal + Humanize.toFixed(Math.abs(_number), usePrecision).split('.')[1]
          : '';
      };

      const usePrecision = Humanize.normalizePrecision(precision);

      const negative = number < 0 && '-' || '';
      const base = String(parseInt(Humanize.toFixed(Math.abs(number || 0), usePrecision), 10));
      const mod = base.length > 3 ? base.length % 3 : 0;

      return negative + firstComma(base, thousand, mod) + commas(base, thousand, mod) + decimals(number, decimal, usePrecision);
    },

    // Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
    // problems for accounting and finance-related software.
    toFixed(value: number, precision?: number): string {
      const usePrecision = exists(precision) ? (precision as number) : Humanize.normalizePrecision(precision, 0);
      const power = Math.pow(10, usePrecision);

      // Multiply up by precision, round accurately, then divide and use native toFixed()
      return (Math.round(value * power) / power).toFixed(usePrecision);
    },

    // Ensures precision value is a positive integer
    normalizePrecision(value: number | undefined, base?: number): number {
      value = Math.round(Math.abs(value as number));
      return (isNaN(value) ? base : value) as number;
    },

    // Converts an integer to its ordinal as a string.
    ordinal(value: number | string): number | string {
      const number = parseInt(value as string, 10);

      if (number === 0) {
        return value;
      }

      const specialCase = number % 100;
      if ([11, 12, 13].indexOf(specialCase) >= 0) {
        return `${number}th`;
      }

      const leastSignificant = number % 10;

      let end;
      switch (leastSignificant) {
        case 1:
          end = 'st';
          break;
        case 2:
          end = 'nd';
          break;
        case 3:
          end = 'rd';
          break;
        default:
          end = 'th';
      }

      return `${number}${end}`;
    },

    // Interprets numbers as occurences. Also accepts an optional array/map of overrides.
    times(value: number | string, overrides: { [digit: number]: string } = {}): string | null {
      if (isFiniteNumber(value) && (value as number) >= 0) {
        const number = parseFloat(value as string);
        const smallTimes = ['never', 'once', 'twice'];
        if (exists(overrides[number])) {
          return String(overrides[number]);
        }
        const numberString = exists(smallTimes[number]) && smallTimes[number].toString();
        return numberString || `${number.toString()} times`;
      }
      return null;
    },

    // Returns the plural version of a given word if the value is not 1. The default
    // suffix is 's'.
    pluralize(number?: number | string | null, singular?: string | null, plural?: string): string | null {
      if (!(exists(number) && exists(singular))) {
        return null;
      }

      plural = exists(plural) ? (plural as string) : `${singular}s`;

      return parseInt(number as string, 10) === 1 ? (singular as string) : plural;
    },

    // Truncates a string if it is longer than the specified number of characters.
    // Truncated strings will end with a translatable ellipsis sequence ("…").
    truncate(str: string, length: number = 100, ending: string = '...'): string {
      if (str.length > length) {
        return str.substring(0, length - ending.length) + ending;
      }
      return str;
    },

    // Truncates a string after a certain number of words.
    truncateWords(string: string, length: number): string | null {
      const array = string.split(' ');
      let result = '';
      let i = 0;

      while (i < length) {
        if (exists(array[i])) {
          result += `${array[i]} `;
        }
        i++;
      }

      if (array.length > length) {
        return `${result}...`;
      }

      return null;
    },

    truncatewords(...args: Parameters<HumanizeStatic['truncateWords']>): string | null {
      return Humanize.truncateWords(...args);
    },

    // Truncates a number to an upper bound.
    boundedNumber(num: number | string, bound: number = 100, ending: string = '+'): string {
      let result;

      if (isFiniteNumber(num) && isFiniteNumber(bound)) {
        if ((num as number) > bound) {
          result = bound + ending;
        }
      }

      return (result || num).toString();
    },

    truncatenumber(...args: Parameters<HumanizeStatic['boundedNumber']>): string {
      return Humanize.boundedNumber(...args);
    },

    // Converts a list of items to a human readable string with an optional limit.
    oxford(items: any[], limit?: number, limitStr?: string): string {
      const numItems = items.length;

      let limitIndex;
      if (numItems < 2) {
        return String(items);
      } else if (numItems === 2) {
        return items.join(' and ');
      } else if (exists(limit) && numItems > (limit as number)) {
        const extra = numItems - (limit as number);
        limitIndex = limit;
        limitStr = exists(limitStr) ? (limitStr as string) : `, and ${extra} ${Humanize.pluralize(extra, 'other')}`;
      } else {
        limitIndex = -1;
        limitStr = `, and ${items[numItems - 1]}`;
      }

      return items.slice(0, limitIndex).join(', ') + limitStr;
    },

    // Describes how many times an item appears in a list
    frequency(list: any, verb: string): string | null {
      if (!isArray(list)) {
        return null;
      }

      const len = list.length;
      const times = Humanize.times(len);

      if (len === 0) {
        return `${times} ${verb}`;
      }
      return `${verb} ${times}`;
    },

    // Converts an object to a definition-like string
    dictionary(object: any, joiner: string = ' is ', separator: string = ', '): string {
      const result = '';

      if (exists(object) && typeof object === 'object' && !isArray(object)) {
        const defs = [];
        for (const key in object) {
          if (object.hasOwnProperty(key)) {
            const val = object[key];
            defs.push(`${key}${joiner}${val}`);
          }
        }
        return defs.join(separator);
      }

      return result;
    },

    // Matches a pace (value and interval) with a logical time frame. Very useful
    // for slow paces.
    pace(value: number, intervalMs: number, unit: string = 'time'): string {
      if (value === 0 || intervalMs === 0) {
        // Needs a better string than this...
        return `No ${Humanize.pluralize(0, unit)}`;
      }

      // Expose these as overridables?
      let prefix = 'Approximately';
      let timeUnit;
      let relativePace;

      const rate = value / intervalMs;
      for (let i = 0; i < TIME_FORMATS.length; i++) {
        const format = TIME_FORMATS[i];
        relativePace = rate * format.value;
        if (relativePace > 1) {
          timeUnit = format.name;
          break;
        }
      }

      if (!timeUnit) {
        // Very slow pace
        prefix = 'Less than';
        relativePace = 1;
        timeUnit = TIME_FORMATS[TIME_FORMATS.length - 1].name;
      }

      const roundedPace = Math.round(relativePace as number);
      unit = Humanize.pluralize(roundedPace, unit) as string;

      return `${prefix} ${roundedPace} ${unit} per ${timeUnit}`;
    },

    // Converts newlines to <br/> tags
    nl2br(string: string, replacement: string = '<br/>'): string {
      return string.replace(/\n/g, replacement);
    },

    // Converts <br/> tags to newlines
    br2nl(string: string, replacement: string = '\r\n'): string {
      return string.replace(/\<br\s*\/?\>/g, replacement);
    },

    // Capitalizes the first letter in a string, optionally downcasing the tail
    capitalize(string: string, downCaseTail: boolean = false): string {
      return `${string.charAt(0).toUpperCase()}${downCaseTail ? string.slice(1).toLowerCase() : string.slice(1)}`;
    },

    // Capitalizes the first letter of each word in a string
    capitalizeAll(string: string): string {
      return string.replace(/(?:^|\s)\S/g, (a: string) => a.toUpperCase());
    },

    // Titlecase words in a string.
    titleCase(string: string): string {
      const smallWords = /\b(a|an|and|at|but|by|de|en|for|if|in|of|on|or|the|to|via|vs?\.?)\b/i;
      const internalCaps = /\S+[A-Z]+\S*/;
      const splitOnWhiteSpaceRegex = /\s+/;
      const splitOnHyphensRegex = /-/;

      const doTitleCase = (_string: string, hyphenated: boolean = false, firstOrLast: boolean = true): string => {
        const titleCasedArray = [];
        const stringArray = _string.split(hyphenated ? splitOnHyphensRegex : splitOnWhiteSpaceRegex);

        for (let index = 0; index < stringArray.length; index++) {
          const word = stringArray[index];
          if (word.indexOf('-') !== -1) {
            titleCasedArray.push(doTitleCase(word, true, index === 0 || index === stringArray.length - 1));
            continue;
          }

          if (firstOrLast && (index === 0 || index === stringArray.length - 1)) {
            titleCasedArray.push(internalCaps.test(word) ? word : Humanize.capitalize(word));
            continue;
          }

          if (internalCaps.test(word)) {
            titleCasedArray.push(word);
          } else if (smallWords.test(word)) {
            titleCasedArray.push(word.toLowerCase());
          } else {
            titleCasedArray.push(Humanize.capitalize(word));
          }
        }

        return titleCasedArray.join(hyphenated ? '-' : ' ');
      };

      return doTitleCase(string);
    },

    titlecase(...args: Parameters<HumanizeStatic['titleCase']>): string {
      return Humanize.titleCase(...args);
    }
  };

  return Humanize;
});
