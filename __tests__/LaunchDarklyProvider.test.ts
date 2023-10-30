import {
  OpenFeature, Client, ErrorCode, ProviderStatus, ProviderEvents,
} from '@openfeature/server-sdk';
import {
  LDClient, LDClientContext, integrations,
} from '@launchdarkly/node-server-sdk';
import { LaunchDarklyProvider } from '../src';
import translateContext from '../src/translateContext';
import TestLogger from './TestLogger';

const basicContext = { targetingKey: 'the-key' };
const testFlagKey = 'a-key';

it('can be initialized', async () => {
  const ldProvider = new LaunchDarklyProvider('sdk-key', { offline: true });
  await ldProvider.initialize({});

  expect(ldProvider.status).toEqual(ProviderStatus.READY);
  await ldProvider.onClose();
});

it('can fail to initialize client', async () => {
  const ldProvider = new LaunchDarklyProvider('sdk-key', {
    updateProcessor: (
      clientContext: LDClientContext,
      dataSourceUpdates: any,
      initSuccessHandler: VoidFunction,
      errorHandler?: (e: Error) => void,
    ) => ({
      start: () => {
        setTimeout(() => errorHandler?.({ code: 401 } as any), 20);
      },
    }),
    sendEvents: false,
  });
  try {
    await ldProvider.initialize({});
  } catch (e) {
    expect((e as Error).message).toEqual('Authentication failed. Double check your SDK key.');
  }
  expect(ldProvider.status).toEqual(ProviderStatus.ERROR);
});

it('emits events for flag changes', async () => {
  const td = new integrations.TestData();
  const ldProvider = new LaunchDarklyProvider('sdk-key', {
    updateProcessor: td.getFactory(),
    sendEvents: false,
  });
  let count = 0;
  ldProvider.events.addHandler(ProviderEvents.ConfigurationChanged, (eventDetail) => {
    expect(eventDetail?.flagsChanged).toEqual(['flagA']);
    count += 1;
  });
  td.update(td.flag('flagA').valueForAll('B'));
  expect(await ldProvider.getClient()
    .stringVariation('flagA', { key: 'test-key' }, 'A'))
    .toEqual('B');
  expect(count).toEqual(1);
  await ldProvider.onClose();
});

describe('given a mock LaunchDarkly client', () => {
  let ldClient: LDClient;
  let ofClient: Client;
  let ldProvider: LaunchDarklyProvider;
  const logger: TestLogger = new TestLogger();

  beforeEach(() => {
    ldProvider = new LaunchDarklyProvider('sdk-key', { logger, offline: true });
    ldClient = ldProvider.getClient();
    OpenFeature.setProvider(ldProvider);

    ofClient = OpenFeature.getClient();
    logger.reset();
  });

  afterEach(async () => {
    await ldProvider.onClose();
    jest.restoreAllMocks();
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
