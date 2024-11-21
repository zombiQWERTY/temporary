import { omitDeep } from '../omitDeep';

describe('omitDeep', () => {
  it('should omit top-level fields', () => {
    const obj = { name: 'Alice', age: 25 };
    const result = omitDeep(obj, ['age']);
    expect(result).toEqual({ name: 'Alice' });
  });

  it('should omit fields from nested objects', () => {
    const obj = {
      name: 'Alice',
      contact: { email: 'alice@example.com', phone: '1234567890' },
    };
    const result = omitDeep(obj, ['phone']);
    expect(result).toEqual({
      name: 'Alice',
      contact: { email: 'alice@example.com' },
    });
  });

  it('should omit fields from objects in arrays', () => {
    const obj = {
      name: 'Alice',
      contacts: [
        { email: 'alice@example.com', phone: '1234567890' },
        { email: 'bob@example.com', phone: '0987654321' },
      ],
    };
    const result = omitDeep(obj, ['phone']);
    expect(result).toEqual({
      name: 'Alice',
      contacts: [{ email: 'alice@example.com' }, { email: 'bob@example.com' }],
    });
  });

  it('should handle complex nested structures', () => {
    const obj = {
      person: {
        name: 'Alice',
        contacts: [{ email: 'alice@example.com', phone: '1234567890' }],
        age: 25,
      },
    };
    const result = omitDeep(obj, ['phone', 'age']);
    expect(result).toEqual({
      person: {
        name: 'Alice',
        contacts: [{ email: 'alice@example.com' }],
      },
    });
  });

  it('should handle edge cases with non-object or empty inputs', () => {
    const obj = { name: 'Alice', metadata: null, tags: [] };
    const result = omitDeep(obj, ['name']);
    expect(result).toEqual({ metadata: null, tags: [] });
  });

  it('should do nothing if no keys match', () => {
    const obj = { name: 'Alice', age: 25 };
    const result = omitDeep(obj, ['height']);
    expect(result).toEqual({ name: 'Alice', age: 25 });
  });

  it('should correctly handle Date objects', () => {
    const date = new Date();
    const obj = {
      name: 'Alice',
      birthdate: date,
    };
    const result = omitDeep(obj, ['name']);
    expect(result).toEqual({ birthdate: date });
    expect(result.birthdate).toBeInstanceOf(Date);
    expect(result.birthdate.getTime()).toBe(date.getTime());
  });
});
