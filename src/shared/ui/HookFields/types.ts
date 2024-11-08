import { FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';

export type HookFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName>;
