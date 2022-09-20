import { EvaluationContext } from '@openfeature/js-sdk';
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

function addCustom(context: LDUser, key: string, value: string
| boolean
| number
| Array<string | boolean | number>) {
  if (!context.custom) {
    context.custom = {};
  }
  context.custom[key] = value;
}

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
    if (key in LDUserBuiltIns) {
      if (typeof value === LDUserBuiltIns[key]) {
        convertedContext[key] = value;
      }
      // If the type does not match, then discard.
    } else if (value instanceof Date) {
      addCustom(convertedContext, key, value.toISOString());
    } else if (Array.isArray(value)) {
      if (value.every((val) => typeof val === 'string')) {
        addCustom(convertedContext, key, value as string[]);
      } else if (value.every((val) => typeof val === 'boolean')) {
        addCustom(convertedContext, key, value as boolean[]);
      } else if (value.every((val) => typeof val === 'number')) {
        addCustom(convertedContext, key, value as string[]);
      }
    } else if (typeof value === 'object') {
      // Discard.
    } else {
      addCustom(convertedContext, key, value);
    }
  });

  return convertedContext;
}
