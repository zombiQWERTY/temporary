declare const _brand: unique symbol;

declare global {
  /**
   * Custom utility types
   */
  export type Nullable<T> = T | null;

  export type Keys<T extends Record<string, unknown>> = keyof T;

  export type Values<T extends Record<string, unknown>> = T[Keys<T>];

  export type Indexed<
    K extends string | number | symbol = string,
    T = unknown,
  > = {
    [key in K]: T;
  };

  export type Brand<K, T> = K & { [_brand]: T };

  export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

  type CompareTypes<A, B, K extends keyof A & keyof B> = A[K] extends B[K]
    ? B[K] extends A[K]
      ? never
      : { key: K; typeInA: A[K]; typeInB: B[K] }
    : { key: K; typeInA: A[K]; typeInB: B[K] };

  export type isEquivalent<A, B> = [
    Exclude<keyof A, keyof B>,
    Exclude<keyof B, keyof A>,
  ] extends [never, never]
    ? {
        [K in keyof A & keyof B]: CompareTypes<A, B, K>;
      }[keyof A & keyof B] extends never
      ? true
      : {
          notEquivalent: true;
          differences: {
            [K in keyof A & keyof B]: CompareTypes<A, B, K>;
          }[keyof A & keyof B];
        }
    : {
        notEquivalent: true;
        diffAWithB: Exclude<keyof A, keyof B>;
        diffBWithA: Exclude<keyof B, keyof A>;
      };

  export type TRequestArgs<
    T,
    RequiredKeys extends keyof T,
    OptionalKeys extends keyof T = never,
  > = {
    [K in RequiredKeys]-?: T[K];
  } & {
    [K in OptionalKeys]+?: T[K];
  };

  export type ConvertDateFieldsToString<T> = {
    [P in keyof T]: P extends 'createdAt' | 'updatedAt' ? string : T[P];
  };

  type NoUndefined<T> = T extends undefined ? never : T;

  /**
   * Type aliases
   */
  export type Phone = string;

  export type Email = string;

  export type Id = number;

  export type DateIso = string;

  export type Timestamp = number;

  export type Penny = number;

  export type Url = string;

  export type Color = string;

  export interface SuccessDto {
    ok: true;
  }
}

export {};
