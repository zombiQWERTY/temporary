// eslint-disable-next-line @typescript-eslint/ban-types
type DeepPartial<T> = T extends Function
  ? T
  : {
      [P in keyof T]: DeepPartial<T[P]>;
    };

export const omitDeep = <T extends object>(
  obj: T,
  keysToOmit: string[],
): DeepPartial<T> => {
  function omit(obj: any): any {
    if (typeof obj === 'function') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    } else if (Array.isArray(obj)) {
      return obj.map(omit);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        if (!keysToOmit.includes(key)) {
          acc[key] = omit(obj[key]);
        }

        return acc;
      }, {} as any);
    }
    return obj;
  }

  return omit(obj);
};
