import getISO639part2Languages from '../../../../FlowPluginsTs/FlowHelpers/1.0.0/iso639Helper';

describe('iso639Helper', () => {
  test('Accepts full language name', () => {
    expect(getISO639part2Languages('Swedish')).toEqual(['swe']);
    expect(getISO639part2Languages('norwegian')).toEqual(['nor', 'nno', 'nob']);
  });

  test('Fails at unknown language name', () => {
    expect(getISO639part2Languages('Svenska')).toEqual(undefined);
  });

  test('Accepts 2 part ISO 639-1 code', () => {
    expect(getISO639part2Languages('JA')).toEqual(['jpn']);
    expect(getISO639part2Languages('no')).toEqual(['nor', 'nno', 'nob']);
  });

  test('Fails at unknown 2 part ISO 639-1 code', () => {
    expect(getISO639part2Languages('zz')).toEqual(undefined);
  });

  test('Accepts 3 part ISO 639-2 code', () => {
    expect(getISO639part2Languages('fin')).toEqual(['fin']);
    expect(getISO639part2Languages('Nno')).toEqual(['nor', 'nno', 'nob']);
  });

  test('Fails at unknown 3 part ISO 639-2 code', () => {
    expect(getISO639part2Languages('zzz')).toEqual(undefined);
    expect(getISO639part2Languages('cmn')).toEqual(undefined); // Mandarin Chinese in ISO 639-3
  });
});
