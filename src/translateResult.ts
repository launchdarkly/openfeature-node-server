import { ResolutionDetails } from '@openfeature/nodejs-sdk';
import { LDEvaluationDetail } from 'launchdarkly-node-server-sdk';

/**
 * Translate an {@link LDEvaluationDetail} to a {@link ResolutionDetails}.
 * @param result The {@link LDEvaluationDetail} to translate.
 * @returns An equivalent {@link ResolutionDetails}.
 *
 * @internal
 */
export default function translateResult<T>(result: LDEvaluationDetail): ResolutionDetails<T> {
  const resolution: ResolutionDetails<T> = {
    value: result.value,
    variant: result.variationIndex?.toString(),
    reason: result.reason.kind,
  };
  if (result.reason.errorKind) {
    resolution.errorCode = result.reason.errorKind;
  }
  return resolution;
}
