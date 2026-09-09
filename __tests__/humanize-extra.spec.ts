// Additional specs covering public methods not exercised by the original suite:
// intComma, intcomma, truncateWords, truncatewords, frequency, capitalizeAll.
// Expected values were verified against the original JavaScript implementation
// (dist/humanize.js of humanize-plus 1.8.2) to guarantee behavioral parity.
//
// The implementation is a UMD script (not an ES module), so it is loaded via
// require; the global HumanizeStatic interface provides the typings.
// The IIFE keeps the Humanize binding out of the global script scope (the
// original spec file already declares `const Humanize` there) while keeping
// this file CommonJS-parseable for jasmine's loader.
(() => {

const Humanize: HumanizeStatic = require('../src/humanize');

describe('humanize (additional coverage)', () => {
  describe('#intComma', () => {
    it('should add commas to an integer', () => {
      expect(Humanize.intComma(123456789)).toEqual('123,456,789');
      expect(Humanize.intComma(0)).toEqual('0');
    });

    it('should honor the decimals argument', () => {
      expect(Humanize.intComma(12345.678, 2)).toEqual('12,345.68');
      expect(Humanize.intComma(12345.678)).toEqual('12,346');
    });
  });

  describe('#intcomma', () => {
    it('should behave identically to intComma', () => {
      expect(Humanize.intcomma(123456789)).toEqual('123,456,789');
      expect(Humanize.intcomma(12345.678, 2)).toEqual('12,345.68');
    });
  });

  describe('#truncateWords', () => {
    it('should truncate a string to the given number of words', () => {
      expect(Humanize.truncateWords('one two three four five', 3)).toEqual('one two three ...');
      expect(Humanize.truncateWords('one two three four five', 2)).toEqual('one two ...');
    });

    it('should return null when the string has too few words to truncate', () => {
      expect(Humanize.truncateWords('short sentence', 3)).toBeNull();
      expect(Humanize.truncateWords('one two three', 3)).toBeNull();
    });
  });

  describe('#truncatewords', () => {
    it('should behave identically to truncateWords', () => {
      expect(Humanize.truncatewords('one two three four five', 2)).toEqual('one two ...');
      expect(Humanize.truncatewords('short sentence', 3)).toBeNull();
    });
  });

  describe('#frequency', () => {
    it('should describe an empty list with the times phrase first', () => {
      expect(Humanize.frequency([], 'looked')).toEqual('never looked');
    });

    it('should describe non-empty lists with the verb first', () => {
      expect(Humanize.frequency(['a'], 'looked')).toEqual('looked once');
      expect(Humanize.frequency(['a', 'b'], 'looked')).toEqual('looked twice');
      expect(Humanize.frequency(['a', 'b', 'c'], 'looked')).toEqual('looked 3 times');
    });

    it('should return null for non-array input', () => {
      expect(Humanize.frequency('not an array', 'looked')).toBeNull();
      expect(Humanize.frequency(undefined, 'looked')).toBeNull();
    });
  });

  describe('#capitalizeAll', () => {
    it('should capitalize every word in a string', () => {
      expect(Humanize.capitalizeAll('some boring string')).toEqual('Some Boring String');
      expect(Humanize.capitalizeAll('hello world')).toEqual('Hello World');
    });
  });
});

})();
