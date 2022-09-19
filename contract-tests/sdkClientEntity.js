const ld = require('launchdarkly-node-server-sdk');
const { OpenFeature } = require('@openfeature/nodejs-sdk');
const { LaunchDarklyProvider } = require('../dist');

const { Log, sdkLogger } = require('./log');

const badCommandError = new Error('unsupported command');

function makeSdkConfig(options, tag) {
  const cf = {
    logger: sdkLogger(tag),
  };
  const maybeTime = seconds => (seconds === undefined || seconds === null ? undefined : seconds / 1000);
  if (options.streaming) {
    cf.streamUri = options.streaming.baseUri;
    cf.streamInitialReconnectDelay = maybeTime(options.streaming.initialRetryDelayMs);
  }
  if(options.polling) {
    cf.stream = false;
    cf.baseUri = options.polling.baseUri;
    cf.pollInterface = options.polling.pollIntervalMs / 1000;
  }
  if (options.events) {
    cf.allAttributesPrivate = options.events.allAttributesPrivate;
    cf.eventsUri = options.events.baseUri;
    cf.capacity = options.events.capacity;
    cf.diagnosticOptOut = !options.events.enableDiagnostics;
    cf.flushInterval = maybeTime(options.events.flushIntervalMs);
    cf.privateAttributes = options.events.globalPrivateAttributes;
  }
  if (options.tags) {
    cf.application = {
      id: options.tags.applicationId,
      version: options.tags.applicationVersion,
    };
  }
  return cf;
}

async function newSdkClientEntity(options) {
  const c = {};
  const log = Log(options.tag);

  log.info('Creating client with configuration: ' + JSON.stringify(options.configuration));
  const timeout =
    options.configuration.startWaitTimeMs !== null && options.configuration.startWaitTimeMs !== undefined
      ? options.configuration.startWaitTimeMs
      : 5000;
  const client = ld.init(
    options.configuration.credential || 'unknown-sdk-key',
    makeSdkConfig(options.configuration, options.tag)
  );

  OpenFeature.setProvider(new LaunchDarklyProvider(client));
  const openFeatureClient = OpenFeature.getClient();

  try {
    await Promise.race([client.waitForInitialization(), new Promise(resolve => setTimeout(resolve, timeout))]);
  } catch (_) {
    // if waitForInitialization() rejects, the client failed to initialize, see next line
  }
  if (!client.initialized() && !options.configuration.initCanFail) {
    client.close();
    throw new Error('client initialization failed');
  }

  c.close = () => {
    client.close();
    log.info('Test ended');
  };

  c.doCommand = async params => {
    log.info('Received command: ' + params.command);
    switch (params.command) {
      case 'openFeatureEvaluate': {
        const pe = params.openFeatureEvaluate;
        if (pe.detail) {
          switch(pe.valueType) {
            case "bool": {
              return await openFeatureClient.getBooleanDetails(pe.flagKey, pe.defaultValue, pe.evaluationContext);
            }
            case "int": {
              const detail =  await openFeatureClient.getNumberDetails(pe.flagKey, pe.defaultValue, pe.evaluationContext);
              console.log("GOT RESOLUTION", detail);
              return detail;
            }
            case "double": {
              return await openFeatureClient.getNumberDetails(pe.flagKey, pe.defaultValue, pe.evaluationContext);
            }
            case "string": {
              return await openFeatureClient.getStringDetails(pe.flagKey, pe.defaultValue, pe.evaluationContext);
            }
            case "any": {
              return await openFeatureClient.getObjectDetails(pe.flagKey, pe.defaultValue, pe.evaluationContext);
            }
          }
        } else {
          switch(pe.valueType) {
            case "bool": {
              const value = await openFeatureClient.getBooleanValue(pe.flagKey, pe.defaultValue, pe.evaluationContext);
              return { value };
            }
            case "int": {
              const value = await openFeatureClient.getNumberValue(pe.flagKey, pe.defaultValue, pe.evaluationContext);
              return { value };
            }
            case "double": {
              const value = await openFeatureClient.getNumberValue(pe.flagKey, pe.defaultValue, pe.evaluationContext);
              return { value };
            }
            case "string": {
              const value = await openFeatureClient.getStringValue(pe.flagKey, pe.defaultValue, pe.evaluationContext);
              return { value };
            }
            case "any": {
              const value = await openFeatureClient.getObjectValue(pe.flagKey, pe.defaultValue, pe.evaluationContext);
              return { value };
            }
          }
        }
      }

      default:
        throw badCommandError;
    }
  };

  return c;
}

module.exports.newSdkClientEntity = newSdkClientEntity;
module.exports.badCommandError = badCommandError;
