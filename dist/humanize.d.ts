/**
 * Type definitions for humanize-plus
 * Copyright 2013-2016 HubSpotDev
 * MIT Licensed
 *
 * This file is copied to dist/humanize.d.ts by the build and describes the
 * public API of dist/humanize.js. It is kept in parity with the
 * HumanizeStatic interface in src/humanize.ts (see types/parity-check.ts).
 */

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

declare const Humanize: HumanizeStatic;

export = Humanize;
export as namespace Humanize;
