import {
  EvaluationContext, FlagValue, Hook,
  Provider, ProviderMetadata, ResolutionDetails,
} from '@openfeature/nodejs-sdk';
import { LDClient, LDEvaluationDetail, LDUser } from 'launchdarkly-node-server-sdk';

/**
 * Convert an OpenFeature evaluation context into an LDUser.
 * @param evalContext The OpenFeature evaluation context to translate.
 * @returns An LDUser based on the evaluation context.
 */
function TranslateContext(evalContext: EvaluationContext): LDUser {
  // TODO: What if key and targetingKey are defined. What if there isn't a key at all?
  const converted = { ...evalContext, key: evalContext.targetingKey };

  return converted;
}

/**
 * Create a {@link  ResolutionDetails} for an evaluation that produced a type different
 * than the expected type.
 * @param value The default value to populate the {@link  ResolutionDetails} with.
 * @returns An {@link  ResolutionDetails} with the default value.
 */
function WrongTypeResult<T>(value: T): ResolutionDetails<T> {
  return {
    value,
    reason: 'ERROR',
    errorCode: 'WRONG_TYPE',
  };
}

/**
 * Translate an {@link LDEvaluationDetail} to a {@link ResolutionDetails}.
 * @param result The {@link LDEvaluationDetail} to translate.
 * @returns An equivalent {@link ResolutionDetails}.
 */
function TranslateResult<T>(result: LDEvaluationDetail): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result.value,
    variant: result.variationIndex?.toString(),
    reason: result.reason.kind,
    errorCode: result.reason.errorKind,
  };
  return resolution;
}

/**
 * An OpenFeature provider for the LaunchDarkly SDK for node.
 */
export default class LaunchDarklyProvider implements Provider {
  readonly metadata: ProviderMetadata = {
    name: 'launchdarkly-node-provider',
  };

  /**
   * Construct an {@link LaunchDarklyProvider}.
   * @param client The LaunchDarkly client instance to use.
   */
  constructor(private readonly client: LDClient) {
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
   * @returns A promise which will resolve to an {@link EvaluationDetails}.
   */
  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<boolean>> {
    const res = await this.client.variationDetail(flagKey, TranslateContext(context), defaultValue);
    if (typeof res.value === 'boolean') {
      return TranslateResult(res);
    }
    return WrongTypeResult<boolean>(defaultValue);
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
   * @returns A promise which will resolve to an {@link EvaluationDetails}.
   */
  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<string>> {
    const res = await this.client.variationDetail(flagKey, TranslateContext(context), defaultValue);
    if (typeof res.value === 'string') {
      return TranslateResult(res);
    }
    return WrongTypeResult<string>(defaultValue);
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
   * @returns A promise which will resolve to an {@link EvaluationDetails}.
   */
  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<number>> {
    const res = await this.client.variationDetail(flagKey, TranslateContext(context), defaultValue);
    if (typeof res.value === 'number') {
      return TranslateResult(res);
    }
    return WrongTypeResult<number>(defaultValue);
  }

  /**
   * Determines the variation of a feature flag for a context, along with information about
   * how it was calculated.
   *
   * @param flagKey The unique key of the feature flag.
   * @param defaultValue The default value of the flag, to be used if the value is not available
   *   from LaunchDarkly.
   * @param context The context requesting the flag. The client will generate an analytics event to
   *   register this context with LaunchDarkly if the context does not already exist.
   * @returns A promise which will resolve to an {@link EvaluationDetails}.
   */
  async resolveObjectEvaluation<U extends object>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<U>> {
    const res = await this.client.variationDetail(flagKey, TranslateContext(context), defaultValue);
    return TranslateResult(res);
  }

  // eslint-disable-next-line class-methods-use-this
  get hooks(): Hook<FlagValue>[] {
    return [];
  }
}
