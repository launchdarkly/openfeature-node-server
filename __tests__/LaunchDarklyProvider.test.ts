import { OpenFeature, Client } from '@openfeature/nodejs-sdk';
import { LDClient } from 'launchdarkly-node-server-sdk';
import { LaunchDarklyProvider } from '../src';
import translateContext from '../src/translateContext';

const basicContext = {targetingKey: 'the-key'};
const testFlagKey = 'a-key';

describe('given a mock LaunchDarkly client', () => {
  let ldClient: LDClient;
  let ofClient: Client;

  beforeEach(() => {
    ldClient = {
      variationDetail: jest.fn(),
    } as any;
    OpenFeature.setProvider(new LaunchDarklyProvider(ldClient));
    ofClient = OpenFeature.getClient();
  });

  it('calls the client correctly for boolean variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: true,
        reason: {
          kind: 'OFF'
        }
      };
    });
    await ofClient.getBooleanDetails(testFlagKey, false, basicContext);
    expect(ldClient.variationDetail).toHaveBeenCalledWith(testFlagKey, translateContext(basicContext), false);
    jest.clearAllMocks();
    await ofClient.getBooleanValue(testFlagKey, false, basicContext);
    expect(ldClient.variationDetail).toHaveBeenCalledWith(testFlagKey, translateContext(basicContext), false);
  });

  it('handles correct return types for boolean variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: true,
        reason: {
          kind: 'OFF'
        }
      };
    });
    const res = await ofClient.getBooleanDetails(testFlagKey, false, basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: true,
      reason: 'OFF'
    });
  });

  it('handles incorrect return types for boolean variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: 'badness',
        reason: {
          kind: 'OFF'
        }
      };
    });
    const res = await ofClient.getBooleanDetails(testFlagKey, false, basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: false,
      reason: 'ERROR',
      errorCode: 'TYPE_MISMATCH'
    });
  });

  it('calls the client correctly for string variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: 'test',
        reason: {
          kind: 'OFF'
        }
      };
    });
    await ofClient.getStringDetails(testFlagKey, 'default', basicContext);
    expect(ldClient.variationDetail).toHaveBeenCalledWith(testFlagKey, translateContext(basicContext), 'default');
    jest.clearAllMocks();
    await ofClient.getStringValue(testFlagKey, 'default', basicContext);
    expect(ldClient.variationDetail).toHaveBeenCalledWith(testFlagKey, translateContext(basicContext), 'default');
  });

  it('handles correct return types for string variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: 'good',
        reason: {
          kind: 'OFF'
        }
      };
    });
    const res = await ofClient.getStringDetails(testFlagKey, 'default', basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: 'good',
      reason: 'OFF'
    });
  });

  it('handles incorrect return types for string variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: true,
        reason: {
          kind: 'OFF'
        }
      };
    });
    const res = await ofClient.getStringDetails(testFlagKey, 'default', basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: 'default',
      reason: 'ERROR',
      errorCode: 'TYPE_MISMATCH'
    });
  });

  it('calls the client correctly for numeric variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: 8,
        reason: {
          kind: 'OFF'
        }
      };
    });
    await ofClient.getNumberDetails(testFlagKey, 0, basicContext);
    expect(ldClient.variationDetail).toHaveBeenCalledWith(testFlagKey, translateContext(basicContext), 0);
    jest.clearAllMocks();
    await ofClient.getNumberValue(testFlagKey, 0, basicContext);
    expect(ldClient.variationDetail).toHaveBeenCalledWith(testFlagKey, translateContext(basicContext), 0);
  });

  it('handles correct return types for numeric variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: 17,
        reason: {
          kind: 'OFF'
        }
      };
    });
    const res = await ofClient.getNumberDetails(testFlagKey, 0, basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: 17,
      reason: 'OFF'
    });
  });

  it('handles incorrect return types for numeric variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: true,
        reason: {
          kind: 'OFF'
        }
      };
    });
    const res = await ofClient.getNumberDetails(testFlagKey, 0, basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: 0,
      reason: 'ERROR',
      errorCode: 'TYPE_MISMATCH'
    });
  });

  it('calls the client correctly for object variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: {yes: 'no'},
        reason: {
          kind: 'OFF'
        }
      };
    });
    await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(ldClient.variationDetail).toHaveBeenCalledWith(testFlagKey, translateContext(basicContext), {});
    jest.clearAllMocks();
    await ofClient.getObjectValue(testFlagKey, {}, basicContext);
    expect(ldClient.variationDetail).toHaveBeenCalledWith(testFlagKey, translateContext(basicContext), {});
  });

  it('handles correct return types for object variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: {some: 'value'},
        reason: {
          kind: 'OFF'
        }
      };
    });
    const res = await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: {some: 'value'},
      reason: 'OFF'
    });
  });

  it('handles incorrect return types for object variations', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: 22,
        reason: {
          kind: 'OFF'
        }
      };
    });
    const res = await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: {},
      reason: 'ERROR',
      errorCode: 'TYPE_MISMATCH'
    });
  });

  it('handles errors from the client', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: {yes: 'no'},
        reason: {
          kind: 'ERROR',
          errorKind: 'BAD_APPLE'
        }
      };
    });
    const res = await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: {yes: 'no'},
      reason: 'ERROR',
      errorCode: 'BAD_APPLE'
    });
  });

  it('includes the variant', async () => {
    ldClient.variationDetail = jest.fn(async () => {
      return {
        value: {yes: 'no'},
        variationIndex: 22,
        reason: {
          kind: 'OFF',
        }
      };
    });
    const res = await ofClient.getObjectDetails(testFlagKey, {}, basicContext);
    expect(res).toEqual({
      flagKey: testFlagKey,
      value: {yes: 'no'},
      variant: '22',
      reason: 'OFF',
    });
  });

});
