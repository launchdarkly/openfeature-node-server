import {
  ErrorCode,
  EvaluationContext, FlagValue, Hook,
  JsonValue,
  Provider, ProviderMetadata, ResolutionDetails, StandardResolutionReasons,
} from '@openfeature/js-sdk';
import {
  basicLogger, LDClient, LDLogger,
} from 'launchdarkly-node-server-sdk';
import { LaunchDarklyProviderOptions } from './LaunchDarklyProviderOptions';
import translateContext from './translateContext';
import translateResult from './translateResult';

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

  readonly metadata: ProviderMetadata = {
    name: 'launchdarkly-node-provider',
  };

  /**
   * Construct a {@link LaunchDarklyProvider}.
   * @param client The LaunchDarkly client instance to use.
   */
  constructor(private readonly client: LDClient, options: LaunchDarklyProviderOptions = {}) {
    if (options.logger) {
      this.logger = options.logger;
    } else {
      this.logger = basicLogger({ level: 'info' });
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
  get hooks(): Hook<FlagValue>[] {
    return [];
  }

  private translateContext(context: EvaluationContext) {
    return translateContext(this.logger, context);
  }
}
