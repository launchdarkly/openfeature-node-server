import translateContext from '../src/translateContext';

it('Uses the targetingKey as the user key', () => {
  expect(translateContext({ targetingKey: 'the-key' })).toEqual({ key: 'the-key' });
});

describe.each([
  ['secondary', 'value1'],
  ['name', 'value2'],
  ['firstName', 'value3'],
  ['lastName', 'value4'],
  ['email', 'value5'],
  ['avatar', 'value6'],
  ['ip', 'value7'],
  ['country', 'value8'],
  ['anonymous', true],
])('given correct built-in attributes', (key, value) => {
  it('translates the key correctly', () => {
    expect(translateContext(
      { targetingKey: 'the-key', [key]: value },
    )).toEqual({
      key: 'the-key',
      [key]: value,
    });
  });
});

describe.each([
  ['secondary', false],
  ['name', 17],
  ['firstName', new Date()],
  ['lastName', true],
  ['email', () => { }],
  ['avatar', {}],
  ['ip', []],
  ['country', 42],
  ['anonymous', 'value'],
])('given incorrect built-in attributes', (key, value) => {
  it('the bad key is omitted', () => {
    expect(translateContext(
      { targetingKey: 'the-key', [key]: value },
    )).toEqual({
      key: 'the-key',
    });
  });
});

it('accepts custom attributes', () => {
  expect(translateContext({ targetingKey: 'the-key', someAttr: 'someValue' })).toEqual({
    key: 'the-key',
    custom: {
      someAttr: 'someValue',
    },
  });
});

it('converts date to ISO strings', () => {
  const date = new Date();
  expect(translateContext({ targetingKey: 'the-key', date })).toEqual({
    key: 'the-key',
    custom: {
      date: date.toISOString(),
    },
  });
});
