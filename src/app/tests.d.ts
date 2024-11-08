import '@testing-library/jest-dom/extend-expect';

declare namespace jest {
  interface Matchers<R> {
    toHaveAttribute(attribute: string, value?: unknown): R;
  }
}
