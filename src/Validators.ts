/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */

// The classes here are static, but needs to be instantiated to
// support the generic functionality. Which is why we do not care about using
// `this`

// These validators are also of trivial complexity, so we are allowing more than
// one per file.

/**
 * Interface for type validation.
 */
 export interface TypeValidator {
  is(u:unknown): boolean;
  getType(): string;
}

/**
 * Validate a basic type.
 */
export class Type<T> implements TypeValidator {
  private typeName: string;

  protected typeOf: string;

  constructor(typeName: string, example: T) {
    this.typeName = typeName;
    this.typeOf = typeof example;
  }

  is(u: unknown): u is T {
    if (Array.isArray(u)) {
      return false;
    }
    return typeof u === this.typeOf;
  }

  getType(): string {
    return this.typeName;
  }
}

/**
 * A set of standard type validators.
 */
export class TypeValidators {
  static readonly String = new Type<string>('string', '');
  static readonly Number = new Type<number>('number', 0);
  static readonly Object = new Type<object>('object', {});
  static readonly Boolean = new Type<boolean>('boolean', true);
}
