import React, { useEffect } from 'react';
import { InputHandlers } from './types';

export interface UseInputOptions {
  /**
   * number of characters allowed for this input
   */
  maxLength: number;
  /**
   * If `true`, the input will be focused
   */
  autoFocus?: boolean;
  /**
   * initial value (don't use together with `value`)
   */
  defaultValue?: string;
  /**
   * value for controlled input
   */
  value?: string;
  /**
   * a function to validate the user input before setting the state
   */
  validator?: (value: string) => boolean;
  /**
   * a callback function when input value changed
   */
  onChange?: (value: string, meta: { invalid: boolean }) => void;
}

export const useIsFirstMount = () => {
  const firstMount = React.useRef(true);
  React.useEffect(() => {
    firstMount.current = false;
  }, []);
  return firstMount.current;
};

export const useInput = (options: UseInputOptions) => {
  const { autoFocus = false, value } = options;
  const ref = React.useRef<HTMLInputElement | null>(null);
  const [internalValue, setInternalValue] = React.useState(
    (value || options.defaultValue || '').slice(0, options.maxLength),
  );

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      if (ref.current.value.length !== 0) {
        ref.current.setSelectionRange(0, ref.current.value.length);
      }
    }
  }, [autoFocus]);

  const isFirstMount = useIsFirstMount();

  useEffect(() => {
    if (!isFirstMount) {
      setInternalValue(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return {
    options,
    value: internalValue,
    invalid:
      typeof options.validator === 'function' &&
      !options.validator(internalValue),
    setValue: setInternalValue,
    getDOM: () => ref.current,
    getInputProps: (handlers?: Pick<InputHandlers, 'onChange'>) => ({
      ref,
      value: internalValue,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = event.target.value;
        handlers?.onChange?.(event);
        inputValue = inputValue.substr(0, options.maxLength);
        setInternalValue(inputValue);
        options.onChange?.(inputValue, {
          invalid:
            typeof options.validator === 'function' &&
            !options.validator(inputValue),
        });
      },
    }),
  };
};
