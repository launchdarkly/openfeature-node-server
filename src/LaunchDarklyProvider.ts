import {
  ErrorCode,
  EvaluationContext, Hook,
  JsonValue,
  OpenFeatureEventEmitter,
  Provider,
  ProviderEvents,
  ProviderMetadata,
  ProviderStatus,
  ResolutionDetails,
  StandardResolutionReasons,
} from '@openfeature/server-sdk';
import {
  basicLogger, init, LDClient, LDLogger, LDOptions,
} from '@launchdarkly/node-server-sdk';
import translateContext from './translateContext';
import translateResult from './translateResult';
import SafeLogger from './SafeLogger';

/**
 * Create a ResolutionDetails for an evaluation that produced a type different
 * than the expected type.
 * @param value The default value to populate the ResolutionDetails with.
 * @returns A ResolutionDetails with the default value.
 */
function wrongTypeResult<T>(value: T): ResolutionDetails<T> {
  return {
    value,
    reason: StandardResolutionReasons.ERROR,
    errorCode: ErrorCode.TYPE_MISMATCH,
  };
}

/**
 * An OpenFeature provider for the LaunchDarkly SDK for node.
 */
export default class LaunchDarklyProvider implements Provider {
  private readonly logger: LDLogger;

  private readonly client: LDClient;

  private readonly clientConstructionError: any;

  readonly metadata: ProviderMetadata = {
    name: 'launchdarkly-node-provider',
  };

  private innerStatus: ProviderStatus = ProviderStatus.NOT_READY;

  public readonly events = new OpenFeatureEventEmitter();

  /**
   * Get the status of the LaunchDarkly provider.
   */
  public get status() {
    return this.innerStatus;
  }

  /**
   * Construct a {@link LaunchDarklyProvider}.
   * @param client The LaunchDarkly client instance to use.
   */
  constructor(sdkKey: string, options: LDOptions = {}) {
    if (options.logger) {
      this.logger = new SafeLogger(options.logger, basicLogger({ level: 'info' }));
    } else {
      this.logger = basicLogger({ level: 'info' });
    }
    try {
      this.client = init(sdkKey, {
        ...options,
        wrapperName: 'open-feature-node-server',
        // The wrapper version should be kept on its own line to allow easy updates using
        // release-please.
        wrapperVersion: '0.6.0', // x-release-please-version
      });
      this.client.on('update', ({ key }: { key: string }) => this.events.emit(ProviderEvents.ConfigurationChanged, { flagsChanged: [key] }));
    } catch (e) {
      this.clientConstructionError = e;
      this.logger.error(`Encountered unrecoverable initialization error, ${e}`);
      this.innerStatus = ProviderStatus.ERROR;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async initialize(context?: EvaluationContext): Promise<void> {
    if (!this.client) {
      // The client could not be constructed.
      if (this.clientConstructionError) {
        throw this.clientConstructionError;
      }
      throw new Error('Unknown problem encountered during initialization');
    }
    try {
      await this.client.waitForInitialization();
      this.innerStatus = ProviderStatus.READY;
    } catch (e) {
      this.innerStatus = ProviderStatus.ERROR;
      throw e;
    }
  }

  /**
   * Determines the boolean variation of a feature flag for a context, along with information about
   * how it was calculated.
   *
   * If the flag does not evaluate to a boolean value, then the defaultValue will be returned.
   *
   * @param flagKey The unique key of the feature flag.
   * @param defaultValue The default value of the flag, to be used if the value is not available
   *   from LaunchDarkly.
   * @param context The context requesting the flag. The client will generate an analytics event to
   *   register this context with LaunchDarkly if the context does not already exist.
   * @returns A promise which will resolve to a ResolutionDetails.
   */
  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<boolean>> {
    const res = await this.client.variationDetail(
      flagKey,
      this.translateContext(context),
      defaultValue,
    );
    if (typeof res.value === 'boolean') {
      return translateResult(res);
    }
    return wrongTypeResult(defaultValue);
  }

  /**
   * Determines the string variation of a feature flag for a context, along with information about
   * how it was calculated.
   *
   * If the flag does not evaluate to a string value, then the defaultValue will be returned.
   *
   * @param flagKey The unique key of the feature flag.
   * @param defaultValue The default value of the flag, to be used if the value is not available
   *   from LaunchDarkly.
   * @param context The context requesting the flag. The client will generate an analytics event to
   *   register this context with LaunchDarkly if the context does not already exist.
   * @returns A promise which will resolve to a ResolutionDetails.
   */
  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<string>> {
    const res = await this.client.variationDetail(
      flagKey,
      this.translateContext(context),
      defaultValue,
    );
    if (typeof res.value === 'string') {
      return translateResult(res);
    }
    return wrongTypeResult(defaultValue);
  }

  /**
   * Determines the numeric variation of a feature flag for a context, along with information about
   * how it was calculated.
   *
   * If the flag does not evaluate to a numeric value, then the defaultValue will be returned.
   *
   * @param flagKey The unique key of the feature flag.
   * @param defaultValue The default value of the flag, to be used if the value is not available
   *   from LaunchDarkly.
   * @param context The context requesting the flag. The client will generate an analytics event to
   *   register this context with LaunchDarkly if the context does not already exist.
   * @returns A promise which will resolve to a ResolutionDetails.
   */
  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<number>> {
    const res = await this.client.variationDetail(
      flagKey,
      this.translateContext(context),
      defaultValue,
    );
    if (typeof res.value === 'number') {
      return translateResult(res);
    }
    return wrongTypeResult(defaultValue);
  }

  /**
   * Determines the object variation of a feature flag for a context, along with information about
   * how it was calculated.
   *
   * @param flagKey The unique key of the feature flag.
   * @param defaultValue The default value of the flag, to be used if the value is not available
   *   from LaunchDarkly.
   * @param context The context requesting the flag. The client will generate an analytics event to
   *   register this context with LaunchDarkly if the context does not already exist.
   * @returns A promise which will resolve to a ResolutionDetails.
   */
  async resolveObjectEvaluation<U extends JsonValue>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<U>> {
    const res = await this.client.variationDetail(
      flagKey,
      this.translateContext(context),
      defaultValue,
    );
    if (typeof res.value === 'object') {
      return translateResult(res);
    }
    return wrongTypeResult<U>(defaultValue);
  }

  // eslint-disable-next-line class-methods-use-this
  get hooks(): Hook[] {
    return [];
  }

  private translateContext(context: EvaluationContext) {
    return translateContext(this.logger, context);
  }

  /**
   * Get the LDClient instance used by this provider.
   *
   * @returns The client for this provider.
   */
  public getClient(): LDClient {
    return this.client;
  }

  /**
   * Called by OpenFeature when it needs to close the provider. This will flush
   * events from the LDClient and then close it.
   */
  async onClose(): Promise<void> {
    await this.client.flush();
    this.client.close();
  }
}
