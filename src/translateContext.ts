import { EvaluationContext } from '@openfeature/js-sdk';
import { LDLogger, LDUser } from 'launchdarkly-node-server-sdk';

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
export default function translateContext(logger: LDLogger, evalContext: EvaluationContext): LDUser {
  const keyAttr = evalContext.key as string;
  const { targetingKey } = evalContext;
  const finalKey = targetingKey ?? keyAttr;

  if (keyAttr != null && targetingKey != null) {
    logger.warn("The EvaluationContext contained both a 'targetingKey' and a 'key' attribute. The"
      + " 'key' attribute will be discarded.");
  }

  if (finalKey == null) {
    logger.error("The EvaluationContext must contain either a 'targetingKey' or a 'key' and the "
      + 'type must be a string.');
  }

  const convertedContext: LDUser = { key: finalKey };
  Object.entries(evalContext).forEach(([key, value]) => {
    if (key === 'targetingKey') {
      return;
    }
    if (key in LDUserBuiltIns) {
      if (typeof value === LDUserBuiltIns[key]) {
        convertedContext[key] = value;
      } else {
        // If the type does not match, then discard.
        logger.error(`The attribute '${key}' must be of type ${LDUserBuiltIns[key]}`);
      }
    } else if (value instanceof Date) {
      addCustom(convertedContext, key, value.toISOString());
    } else if (Array.isArray(value)) {
      if (value.every((val) => typeof val === 'string')) {
        addCustom(convertedContext, key, value as string[]);
      } else if (value.every((val) => typeof val === 'boolean')) {
        addCustom(convertedContext, key, value as boolean[]);
      } else if (value.every((val) => typeof val === 'number')) {
        addCustom(convertedContext, key, value as string[]);
      } else {
        logger.warn(`The attribute '${key}' is an unsupported array type.`);
      }
    } else if (typeof value === 'object') {
      logger.warn(`The attribute '${key}' is of an unsupported type 'object'`);
      // Discard.
    } else {
      addCustom(convertedContext, key, value);
    }
  });

  return convertedContext;
}
