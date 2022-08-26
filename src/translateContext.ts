import { EvaluationContext } from '@openfeature/nodejs-sdk';
import { LDUser } from 'launchdarkly-node-server-sdk';

const LDUserBuiltIns = {
  secondary: 'string',
  name: 'string',
  firstName: 'string',
  lastName: 'string',
  email: 'string',
  avatar: 'string',
  ip: 'string',
  country: 'string',
  anonymous: 'boolean',
};

/**
 * Convert an OpenFeature evaluation context into an LDUser.
 * @param evalContext The OpenFeature evaluation context to translate.
 * @returns An LDUser based on the evaluation context.
 *
 * @internal
 */
export default function translateContext(evalContext: EvaluationContext): LDUser {
  const convertedContext: LDUser = { key: evalContext.targetingKey };
  Object.entries(evalContext).forEach(([key, value]) => {
    if (key === 'targetingKey') {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(LDUserBuiltIns, key)) {
      if (typeof value === LDUserBuiltIns[key]) {
        convertedContext[key] = value;
      }
      // If the type does not match, then discard.
    } else {
      if (!convertedContext.custom) {
        convertedContext.custom = {};
      }
      if (value instanceof Date) {
        convertedContext.custom[key] = value.toISOString();
      } else if (typeof value === 'object') {
        // Discard.
      } else {
        convertedContext.custom[key] = value;
      }
    }
  });

  return convertedContext;
}
