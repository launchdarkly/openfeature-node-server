import {
  EvaluationContext, FlagValue, Hook,
  Provider, ProviderMetadata, ResolutionDetails,
} from '@openfeature/nodejs-sdk';
import { LDClient, LDEvaluationDetail, LDUser } from 'launchdarkly-node-server-sdk';
import { TypeValidators } from './Validators';

function TranslateContext(evalContext: EvaluationContext): LDUser {
  const converted = { ...evalContext, key: evalContext.targetingKey };

  return converted;
}

function WrongTypeResult<T>(value: T): ResolutionDetails<T> {
  return {
    value,
    reason: 'DEFAULT',
    errorCode: 'WRONG_TYPE',
  };
}

function TranslateResult<T>(result: LDEvaluationDetail): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result.value,
    variant: result.variationIndex?.toString(),
    reason: result.reason.kind,
    errorCode: result.reason.errorKind,
  };
  return resolution;
}

export default class LaunchDarklyProvider implements Provider {
  readonly metadata: ProviderMetadata = {
    name: 'launchdarkly-node-provider',
  };

  constructor(private readonly client: LDClient) {
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<boolean>> {
    const res = await this.client.variationDetail(flagKey, TranslateContext(context), defaultValue);
    if (TypeValidators.Boolean.is(res.value)) {
      return TranslateResult(res);
    }
    return WrongTypeResult<boolean>(defaultValue);
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<string>> {
    const res = await this.client.variationDetail(flagKey, TranslateContext(context), defaultValue);
    if (TypeValidators.String.is(res.value)) {
      return TranslateResult(res);
    }
    return WrongTypeResult<string>(defaultValue);
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
  ): Promise<ResolutionDetails<number>> {
    const res = await this.client.variationDetail(flagKey, TranslateContext(context), defaultValue);
    if (TypeValidators.Number.is(res.value)) {
      return TranslateResult(res);
    }
    return WrongTypeResult<number>(defaultValue);
  }

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
