/* humanize.js - v1.8.2 */
"use strict";
/**
 * Copyright 2013-2016 HubSpotDev
 * MIT Licensed
 *
 * @module humanize.ts
 */
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define([], function () { return (root.Humanize = factory()); });
    }
    else {
        root.Humanize = factory();
    }
})(this, function () {
    var TIME_FORMATS = [
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
    var LABELS_FOR_POWERS_OF_KILO = {
        P: Math.pow(2, 50),
        T: Math.pow(2, 40),
        G: Math.pow(2, 30),
        M: Math.pow(2, 20)
    };
    var exists = function (maybe) { return typeof maybe !== 'undefined' && maybe !== null; };
    var isNaN = function (value) { return value !== value; };
    var isFiniteNumber = function (value) { return isFinite(value) && !isNaN(parseFloat(value)); };
    var isArray = function (value) { return Object.prototype.toString.call(value) === '[object Array]'; };
    var Humanize = {
        // DEPRECATED: Use compactInteger instead
        intword: function (number, charWidth, decimals) {
            if (decimals === void 0) { decimals = 2; }
            /*
             * This method is deprecated. Please use compactInteger instead.
             * intword will be going away in the next major version.
             */
            return Humanize.compactInteger(number, decimals);
        },
        // Converts an integer to its most compact representation
        compactInteger: function (input, decimals) {
            if (decimals === void 0) { decimals = 0; }
            decimals = Math.max(decimals, 0);
            var number = parseInt(input, 10);
            var signString = number < 0 ? '-' : '';
            var unsignedNumber = Math.abs(number);
            var unsignedNumberString = String(unsignedNumber);
            var numberLength = unsignedNumberString.length;
            var numberLengths = [13, 10, 7, 4];
            var bigNumPrefixes = ['T', 'B', 'M', 'k'];
            // small numbers
            if (unsignedNumber < 1000) {
                return "".concat(signString).concat(unsignedNumberString);
            }
            // really big numbers
            if (numberLength > numberLengths[0] + 3) {
                return number.toExponential(decimals).replace('e+', 'x10^');
            }
            // 999 < unsignedNumber < 999,999,999,999,999
            var length;
            for (var i = 0; i < numberLengths.length; i++) {
                var _length = numberLengths[i];
                if (numberLength >= _length) {
                    length = _length;
                    break;
                }
            }
            var decimalIndex = numberLength - length + 1;
            var unsignedNumberCharacterArray = unsignedNumberString.split('');
            var wholePartArray = unsignedNumberCharacterArray.slice(0, decimalIndex);
            var decimalPartArray = unsignedNumberCharacterArray.slice(decimalIndex, decimalIndex + decimals + 1);
            var wholePart = wholePartArray.join('');
            // pad decimalPart if necessary
            var decimalPart = decimalPartArray.join('');
            if (decimalPart.length < decimals) {
                decimalPart += "".concat(Array(decimals - decimalPart.length + 1).join('0'));
            }
            var output;
            if (decimals === 0) {
                output = "".concat(signString).concat(wholePart).concat(bigNumPrefixes[numberLengths.indexOf(length)]);
            }
            else {
                var outputNumber = Number("".concat(wholePart, ".").concat(decimalPart)).toFixed(decimals);
                output = "".concat(signString).concat(outputNumber).concat(bigNumPrefixes[numberLengths.indexOf(length)]);
            }
            return output;
        },
        // Converts an integer into its most compact representation
        intComma: function (number, decimals) {
            if (decimals === void 0) { decimals = 0; }
            return Humanize.formatNumber(number, decimals);
        },
        intcomma: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return Humanize.intComma.apply(Humanize, args);
        },
        // Formats the value like a 'human-readable' file size (i.e. '13 KB', '4.1 MB', '102 bytes', etc).
        fileSize: function (filesize, precision) {
            if (precision === void 0) { precision = 2; }
            for (var label in LABELS_FOR_POWERS_OF_KILO) {
                if (LABELS_FOR_POWERS_OF_KILO.hasOwnProperty(label)) {
                    var minnum = LABELS_FOR_POWERS_OF_KILO[label];
                    if (filesize >= minnum) {
                        return "".concat(Humanize.formatNumber(filesize / minnum, precision, ''), " ").concat(label, "B");
                    }
                }
            }
            if (filesize >= 1024) {
                return "".concat(Humanize.formatNumber(filesize / 1024, 0), " KB");
            }
            return "".concat(Humanize.formatNumber(filesize, 0)).concat(Humanize.pluralize(filesize, ' byte'));
        },
        filesize: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return Humanize.fileSize.apply(Humanize, args);
        },
        // Formats a number to a human-readable string.
        // Localize by overriding the precision, thousand and decimal arguments.
        formatNumber: function (number, precision, thousand, decimal) {
            // Create some private utility functions to make the computational
            // code that follows much easier to read.
            if (precision === void 0) { precision = 0; }
            if (thousand === void 0) { thousand = ','; }
            if (decimal === void 0) { decimal = '.'; }
            var firstComma = function (_number, _thousand, _position) {
                return _position ? _number.substr(0, _position) + _thousand : '';
            };
            var commas = function (_number, _thousand, _position) {
                return _number.substr(_position).replace(/(\d{3})(?=\d)/g, "$1".concat(_thousand));
            };
            var decimals = function (_number, _decimal, usePrecision) {
                return usePrecision
                    ? _decimal + Humanize.toFixed(Math.abs(_number), usePrecision).split('.')[1]
                    : '';
            };
            var usePrecision = Humanize.normalizePrecision(precision);
            var negative = number < 0 && '-' || '';
            var base = String(parseInt(Humanize.toFixed(Math.abs(number || 0), usePrecision), 10));
            var mod = base.length > 3 ? base.length % 3 : 0;
            return negative + firstComma(base, thousand, mod) + commas(base, thousand, mod) + decimals(number, decimal, usePrecision);
        },
        // Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
        // problems for accounting and finance-related software.
        toFixed: function (value, precision) {
            var usePrecision = exists(precision) ? precision : Humanize.normalizePrecision(precision, 0);
            var power = Math.pow(10, usePrecision);
            // Multiply up by precision, round accurately, then divide and use native toFixed()
            return (Math.round(value * power) / power).toFixed(usePrecision);
        },
        // Ensures precision value is a positive integer
        normalizePrecision: function (value, base) {
            value = Math.round(Math.abs(value));
            return (isNaN(value) ? base : value);
        },
        // Converts an integer to its ordinal as a string.
        ordinal: function (value) {
            var number = parseInt(value, 10);
            if (number === 0) {
                return value;
            }
            var specialCase = number % 100;
            if ([11, 12, 13].indexOf(specialCase) >= 0) {
                return "".concat(number, "th");
            }
            var leastSignificant = number % 10;
            var end;
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
            return "".concat(number).concat(end);
        },
        // Interprets numbers as occurences. Also accepts an optional array/map of overrides.
        times: function (value, overrides) {
            if (overrides === void 0) { overrides = {}; }
            if (isFiniteNumber(value) && value >= 0) {
                var number = parseFloat(value);
                var smallTimes = ['never', 'once', 'twice'];
                if (exists(overrides[number])) {
                    return String(overrides[number]);
                }
                var numberString = exists(smallTimes[number]) && smallTimes[number].toString();
                return numberString || "".concat(number.toString(), " times");
            }
            return null;
        },
        // Returns the plural version of a given word if the value is not 1. The default
        // suffix is 's'.
        pluralize: function (number, singular, plural) {
            if (!(exists(number) && exists(singular))) {
                return null;
            }
            plural = exists(plural) ? plural : "".concat(singular, "s");
            return parseInt(number, 10) === 1 ? singular : plural;
        },
        // Truncates a string if it is longer than the specified number of characters.
        // Truncated strings will end with a translatable ellipsis sequence ("…").
        truncate: function (str, length, ending) {
            if (length === void 0) { length = 100; }
            if (ending === void 0) { ending = '...'; }
            if (str.length > length) {
                return str.substring(0, length - ending.length) + ending;
            }
            return str;
        },
        // Truncates a string after a certain number of words.
        truncateWords: function (string, length) {
            var array = string.split(' ');
            var result = '';
            var i = 0;
            while (i < length) {
                if (exists(array[i])) {
                    result += "".concat(array[i], " ");
                }
                i++;
            }
            if (array.length > length) {
                return "".concat(result, "...");
            }
            return null;
        },
        truncatewords: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return Humanize.truncateWords.apply(Humanize, args);
        },
        // Truncates a number to an upper bound.
        boundedNumber: function (num, bound, ending) {
            if (bound === void 0) { bound = 100; }
            if (ending === void 0) { ending = '+'; }
            var result;
            if (isFiniteNumber(num) && isFiniteNumber(bound)) {
                if (num > bound) {
                    result = bound + ending;
                }
            }
            return (result || num).toString();
        },
        truncatenumber: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return Humanize.boundedNumber.apply(Humanize, args);
        },
        // Converts a list of items to a human readable string with an optional limit.
        oxford: function (items, limit, limitStr) {
            var numItems = items.length;
            var limitIndex;
            if (numItems < 2) {
                return String(items);
            }
            else if (numItems === 2) {
                return items.join(' and ');
            }
            else if (exists(limit) && numItems > limit) {
                var extra = numItems - limit;
                limitIndex = limit;
                limitStr = exists(limitStr) ? limitStr : ", and ".concat(extra, " ").concat(Humanize.pluralize(extra, 'other'));
            }
            else {
                limitIndex = -1;
                limitStr = ", and ".concat(items[numItems - 1]);
            }
            return items.slice(0, limitIndex).join(', ') + limitStr;
        },
        // Describes how many times an item appears in a list
        frequency: function (list, verb) {
            if (!isArray(list)) {
                return null;
            }
            var len = list.length;
            var times = Humanize.times(len);
            if (len === 0) {
                return "".concat(times, " ").concat(verb);
            }
            return "".concat(verb, " ").concat(times);
        },
        // Converts an object to a definition-like string
        dictionary: function (object, joiner, separator) {
            if (joiner === void 0) { joiner = ' is '; }
            if (separator === void 0) { separator = ', '; }
            var result = '';
            if (exists(object) && typeof object === 'object' && !isArray(object)) {
                var defs = [];
                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        var val = object[key];
                        defs.push("".concat(key).concat(joiner).concat(val));
                    }
                }
                return defs.join(separator);
            }
            return result;
        },
        // Matches a pace (value and interval) with a logical time frame. Very useful
        // for slow paces.
        pace: function (value, intervalMs, unit) {
            if (unit === void 0) { unit = 'time'; }
            if (value === 0 || intervalMs === 0) {
                // Needs a better string than this...
                return "No ".concat(Humanize.pluralize(0, unit));
            }
            // Expose these as overridables?
            var prefix = 'Approximately';
            var timeUnit;
            var relativePace;
            var rate = value / intervalMs;
            for (var i = 0; i < TIME_FORMATS.length; i++) {
                var format = TIME_FORMATS[i];
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
            var roundedPace = Math.round(relativePace);
            unit = Humanize.pluralize(roundedPace, unit);
            return "".concat(prefix, " ").concat(roundedPace, " ").concat(unit, " per ").concat(timeUnit);
        },
        // Converts newlines to <br/> tags
        nl2br: function (string, replacement) {
            if (replacement === void 0) { replacement = '<br/>'; }
            return string.replace(/\n/g, replacement);
        },
        // Converts <br/> tags to newlines
        br2nl: function (string, replacement) {
            if (replacement === void 0) { replacement = '\r\n'; }
            return string.replace(/\<br\s*\/?\>/g, replacement);
        },
        // Capitalizes the first letter in a string, optionally downcasing the tail
        capitalize: function (string, downCaseTail) {
            if (downCaseTail === void 0) { downCaseTail = false; }
            return "".concat(string.charAt(0).toUpperCase()).concat(downCaseTail ? string.slice(1).toLowerCase() : string.slice(1));
        },
        // Capitalizes the first letter of each word in a string
        capitalizeAll: function (string) {
            return string.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
        },
        // Titlecase words in a string.
        titleCase: function (string) {
            var smallWords = /\b(a|an|and|at|but|by|de|en|for|if|in|of|on|or|the|to|via|vs?\.?)\b/i;
            var internalCaps = /\S+[A-Z]+\S*/;
            var splitOnWhiteSpaceRegex = /\s+/;
            var splitOnHyphensRegex = /-/;
            var doTitleCase = function (_string, hyphenated, firstOrLast) {
                if (hyphenated === void 0) { hyphenated = false; }
                if (firstOrLast === void 0) { firstOrLast = true; }
                var titleCasedArray = [];
                var stringArray = _string.split(hyphenated ? splitOnHyphensRegex : splitOnWhiteSpaceRegex);
                for (var index = 0; index < stringArray.length; index++) {
                    var word = stringArray[index];
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
                    }
                    else if (smallWords.test(word)) {
                        titleCasedArray.push(word.toLowerCase());
                    }
                    else {
                        titleCasedArray.push(Humanize.capitalize(word));
                    }
                }
                return titleCasedArray.join(hyphenated ? '-' : ' ');
            };
            return doTitleCase(string);
        },
        titlecase: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return Humanize.titleCase.apply(Humanize, args);
        }
    };
    return Humanize;
});
