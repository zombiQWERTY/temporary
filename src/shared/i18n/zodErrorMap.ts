import { useTranslations } from 'next-intl';
import { ZodIssueCode, ZodParsedType, defaultErrorMap, ZodErrorMap } from 'zod';

const jsonStringifyReplacer = (_: string, value: unknown): unknown => {
  return typeof value === 'bigint' ? value.toString() : value;
};

function joinValues<T extends unknown[]>(array: T, separator = ' | '): string {
  return array
    .map((val) => (typeof val === 'string' ? `'${val}'` : val))
    .join(separator);
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' && value !== null && Object.keys(value).length > 0
  );
};

const getKeyAndValues = (
  param: unknown,
  defaultKey: string,
): {
  values: Record<string, unknown>;
  key: string;
} => {
  if (typeof param === 'string') return { key: param, values: {} };
  if (isRecord(param)) {
    const key = typeof param.key === 'string' ? param.key : defaultKey;
    const values = isRecord(param.values) ? param.values : {};
    return { key, values };
  }
  return { key: defaultKey, values: {} };
};

type ZodI18nMapOption = {
  t: ReturnType<typeof useTranslations>;
  tFieldNames?: ReturnType<typeof useTranslations>;
  tCustomErrors?: ReturnType<typeof useTranslations>;
};

type MakeZodI18nMap = (option: ZodI18nMapOption) => ZodErrorMap;

export const makeZodI18nMap: MakeZodI18nMap =
  ({ t, tFieldNames, tCustomErrors }) =>
  (issue, ctx) => {
    let message = defaultErrorMap(issue, ctx).message;

    const path =
      issue.path.length > 0 && tFieldNames
        ? tFieldNames(issue.path.join('.') as any)
        : undefined;

    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        message =
          issue.received === ZodParsedType.undefined
            ? t('errors.invalid_type_received_undefined', { path })
            : t('errors.invalid_type', {
                expected: t(`types.${issue.expected}`),
                received: t(`types.${issue.received}`),
                path,
              });
        break;

      case ZodIssueCode.invalid_literal:
        message = t('errors.invalid_literal', {
          expected: JSON.stringify(issue.expected, jsonStringifyReplacer),
          path,
        });
        break;

      case ZodIssueCode.unrecognized_keys:
        message = t('errors.unrecognized_keys', {
          keys: joinValues(issue.keys, ', '),
          count: issue.keys.length,
          path,
        });
        break;

      case ZodIssueCode.invalid_union:
      case ZodIssueCode.invalid_arguments:
      case ZodIssueCode.invalid_return_type:
      case ZodIssueCode.invalid_date:
        message = t(`errors.${issue.code}`, { path });
        break;

      case ZodIssueCode.invalid_union_discriminator:
        message = t('errors.invalid_union_discriminator', {
          options: joinValues(issue.options),
          path,
        });
        break;

      case ZodIssueCode.invalid_enum_value:
        message = t('errors.invalid_enum_value', {
          options: joinValues(issue.options),
          received: issue.received,
          path,
        });
        break;

      case ZodIssueCode.invalid_string:
        if (typeof issue.validation === 'object') {
          message =
            'startsWith' in issue.validation
              ? t('errors.invalid_string.startsWith', {
                  startsWith: issue.validation.startsWith,
                  path,
                })
              : t('errors.invalid_string.endsWith', {
                  endsWith:
                    'endsWith' in issue.validation
                      ? issue.validation.endsWith
                      : '',
                  path,
                });
        } else {
          message = t(`errors.invalid_string.${issue.validation}`, {
            validation: t(`validations.${issue.validation}`),
            path,
          });
        }
        break;

      case ZodIssueCode.too_small: {
        const minimum =
          issue.type === 'date'
            ? new Date(issue.minimum as number)
            : issue.minimum;
        message = t(
          `errors.too_small.${issue.type}.${issue.exact ? 'exact' : issue.inclusive ? 'inclusive' : 'not_inclusive'}`,
          {
            minimum: String(minimum),
            count: typeof minimum === 'number' ? minimum : undefined,
            path,
          },
        );
        break;
      }

      case ZodIssueCode.too_big: {
        const maximum =
          issue.type === 'date'
            ? new Date(issue.maximum as number)
            : issue.maximum;
        message = t(
          `errors.too_big.${issue.type}.${issue.exact ? 'exact' : issue.inclusive ? 'inclusive' : 'not_inclusive'}`,
          {
            maximum: String(maximum),
            count: typeof maximum === 'number' ? maximum : undefined,
            path,
          },
        );
        break;
      }

      case ZodIssueCode.custom: {
        const { key, values } = getKeyAndValues(
          issue.params?.i18n,
          'errors.custom',
        );
        message = (tCustomErrors || t)(key as Parameters<typeof t>[0], {
          ...values,
          path,
        });
        break;
      }

      case ZodIssueCode.invalid_intersection_types:
        message = t('errors.invalid_intersection_types', { path });
        break;

      case ZodIssueCode.not_multiple_of:
        message = t('errors.not_multiple_of', {
          multipleOf: issue.multipleOf as number,
          path,
        });
        break;

      case ZodIssueCode.not_finite:
        message = t('errors.not_finite', { path });
        break;

      default:
        break;
    }

    return { message };
  };
