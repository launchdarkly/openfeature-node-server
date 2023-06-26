import { OpenFeature, Client, ErrorCode } from '@openfeature/js-sdk';
import { LDClient } from 'launchdarkly-node-server-sdk';
import { LaunchDarklyProvider } from '../src';
import translateContext from '../src/translateContext';
import TestLogger from './TestLogger';

const basicContext = { targetingKey: 'the-key' };
const testFlagKey = 'a-key';

describe('given a mock LaunchDarkly client', () => {
  let ldClient: LDClient;
  let ofClient: Client;
  const logger: TestLogger = new TestLogger();

  beforeEach(() => {
    ldClient = {
      variationDetail: jest.fn(),
    } as any;
    OpenFeature.setProvider(new LaunchDarklyProvider(ldClient, { logger }));
    ofClient = OpenFeature.getClient();
    logger.reset();
  });

  it('calls the client correctly for boolean variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: true,
      reason: {
        kind: 'OFF',
      },
    }));
    await ofClient.getBooleanDetails(testFlagKey, false, basicContext);
    expect(ldClient.variationDetail)
      .toHaveBeenCalledWith(testFlagKey, translateContext(logger, basicContext), false);
    jest.clearAllMocks();
    await ofClient.getBooleanValue(testFlagKey, false, basicContext);
    expect(ldClient.variationDetail)
      .toHaveBeenCalledWith(testFlagKey, translateContext(logger, basicContext), false);
  });

  it('handles correct return types for boolean variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: true,
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getBooleanDetails(testFlagKey, false, basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: true,
      reason: 'OFF',
    });
  });

  it('handles incorrect return types for boolean variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: 'badness',
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getBooleanDetails(testFlagKey, false, basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: false,
      reason: 'ERROR',
      errorCode: 'TYPE_MISMATCH',
    });
  });

  it('calls the client correctly for string variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: 'test',
      reason: {
        kind: 'OFF',
      },
    }));
    await ofClient.getStringDetails(testFlagKey, 'default', basicContext);
    expect(ldClient.variationDetail)
      .toHaveBeenCalledWith(testFlagKey, translateContext(logger, basicContext), 'default');
    jest.clearAllMocks();
    await ofClient.getStringValue(testFlagKey, 'default', basicContext);
    expect(ldClient.variationDetail)
      .toHaveBeenCalledWith(testFlagKey, translateContext(logger, basicContext), 'default');
  });

  it('handles correct return types for string variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: 'good',
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getStringDetails(testFlagKey, 'default', basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: 'good',
      reason: 'OFF',
    });
  });

  it('handles incorrect return types for string variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: true,
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getStringDetails(testFlagKey, 'default', basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: 'default',
      reason: 'ERROR',
      errorCode: 'TYPE_MISMATCH',
    });
  });

  it('calls the client correctly for numeric variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: 8,
      reason: {
        kind: 'OFF',
      },
    }));
    await ofClient.getNumberDetails(testFlagKey, 0, basicContext);
    expect(ldClient.variationDetail)
      .toHaveBeenCalledWith(testFlagKey, translateContext(logger, basicContext), 0);
    jest.clearAllMocks();
    await ofClient.getNumberValue(testFlagKey, 0, basicContext);
    expect(ldClient.variationDetail)
      .toHaveBeenCalledWith(testFlagKey, translateContext(logger, basicContext), 0);
  });

  it('handles correct return types for numeric variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: 17,
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getNumberDetails(testFlagKey, 0, basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: 17,
      reason: 'OFF',
    });
  });

  it('handles incorrect return types for numeric variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: true,
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getNumberDetails(testFlagKey, 0, basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: 0,
      reason: 'ERROR',
      errorCode: 'TYPE_MISMATCH',
    });
  });

  it('calls the client correctly for object variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: { yes: 'no' },
      reason: {
        kind: 'OFF',
      },
    }));
    await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(ldClient.variationDetail)
      .toHaveBeenCalledWith(testFlagKey, translateContext(logger, basicContext), {});
    jest.clearAllMocks();
    await ofClient.getObjectValue(testFlagKey, {}, basicContext);
    expect(ldClient.variationDetail)
      .toHaveBeenCalledWith(testFlagKey, translateContext(logger, basicContext), {});
  });

  it('handles correct return types for object variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: { some: 'value' },
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: { some: 'value' },
      reason: 'OFF',
    });
  });

  it('handles incorrect return types for object variations', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: 22,
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: {},
      reason: 'ERROR',
      errorCode: 'TYPE_MISMATCH',
    });
  });

  it.each([
    ['CLIENT_NOT_READY', ErrorCode.PROVIDER_NOT_READY],
    ['MALFORMED_FLAG', ErrorCode.PARSE_ERROR],
    ['FLAG_NOT_FOUND', ErrorCode.FLAG_NOT_FOUND],
    ['USER_NOT_SPECIFIED', ErrorCode.TARGETING_KEY_MISSING],
    ['UNSPECIFIED', ErrorCode.GENERAL],
    [undefined, ErrorCode.GENERAL],
  ])('handles errors from the client', async (ldError, ofError) => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: { yes: 'no' },
      reason: {
        kind: 'ERROR',
        errorKind: ldError,
      },
    }));
    const res = await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: { yes: 'no' },
      reason: 'ERROR',
      errorCode: ofError,
    });
  });

  it('includes the variant', async () => {
    ldClient.variationDetail = jest.fn(async () => ({
      value: { yes: 'no' },
      variationIndex: 22,
      reason: {
        kind: 'OFF',
      },
    }));
    const res = await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(res).toMatchObject({
      flagKey: testFlagKey,
      value: { yes: 'no' },
      variant: '22',
      reason: 'OFF',
    });
  });

  it('logs information about missing keys', async () => {
    await ofClient.getObjectDetails(testFlagKey, {}, {});
    expect(logger.logs[0]).toEqual("The EvaluationContext must contain either a 'targetingKey' "
    + "or a 'key' and the type must be a string.");
  });

  it('logs information about double keys', async () => {
    await ofClient.getObjectDetails(testFlagKey, {}, { targetingKey: '1', key: '2' });
    expect(logger.logs[0]).toEqual("The EvaluationContext contained both a 'targetingKey' and a"
    + " 'key' attribute. The 'key' attribute will be discarded.");
  });
});
