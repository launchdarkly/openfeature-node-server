import translateContext from '../src/translateContext';
import TestLogger from './TestLogger';

it('Uses the targetingKey as the user key', () => {
  const logger = new TestLogger();
  expect(translateContext(logger, { targetingKey: 'the-key' })).toEqual({ key: 'the-key' });
  expect(logger.logs.length).toEqual(0);
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
  const logger = new TestLogger();
  it('translates the key correctly', () => {
    expect(translateContext(
      logger,
      { targetingKey: 'the-key', [key]: value },
    )).toEqual({
      key: 'the-key',
      [key]: value,
    });
    expect(logger.logs.length).toEqual(0);
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
    const logger = new TestLogger();
    expect(translateContext(
      logger,
      { targetingKey: 'the-key', [key]: value },
    )).toEqual({
      key: 'the-key',
    });
    expect(logger.logs[0]).toMatch(new RegExp(`The attribute '${key}' must be of type.*`));
  });
});

it('accepts custom attributes', () => {
  const logger = new TestLogger();
  expect(translateContext(logger, { targetingKey: 'the-key', someAttr: 'someValue' })).toEqual({
    key: 'the-key',
    custom: {
      someAttr: 'someValue',
    },
  });
  expect(logger.logs.length).toEqual(0);
});

it('ignores custom attributes that are objects', () => {
  const logger = new TestLogger();
  expect(translateContext(logger, { targetingKey: 'the-key', someAttr: {} })).toEqual({
    key: 'the-key',
  });
  expect(logger.logs[0]).toEqual("The attribute 'someAttr' is of an unsupported type 'object'");
});

it('accepts string/boolean/number arrays', () => {
  const logger = new TestLogger();
  expect(translateContext(logger, {
    targetingKey: 'the-key',
    strings: ['a', 'b', 'c'],
    numbers: [1, 2, 3],
    booleans: [true, false],
  })).toEqual({
    key: 'the-key',
    custom: {
      strings: ['a', 'b', 'c'],
      numbers: [1, 2, 3],
      booleans: [true, false],
    },
  });
  expect(logger.logs.length).toEqual(0);
});

it('discards invalid array types', () => {
  const logger = new TestLogger();
  expect(translateContext(
    logger,
    {
      targetingKey: 'the-key',
      dates: [new Date()],
    },
  )).toEqual({
    key: 'the-key',
  });
  expect(logger.logs[0]).toEqual("The attribute 'dates' is an unsupported array type.");
});

it('converts date to ISO strings', () => {
  const date = new Date();
  const logger = new TestLogger();
  expect(translateContext(
    logger,
    { targetingKey: 'the-key', date },
  )).toEqual({
    key: 'the-key',
    custom: {
      date: date.toISOString(),
    },
  });
  expect(logger.logs.length).toEqual(0);
});
