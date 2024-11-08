export enum PageTypeEnum {
  Registration = 'recovery',
  Confirm = 'confirm',
}

export interface SignUpState {
  phone: string | null;
  email: string | null;
  password: string | null;
  referralCode?: string;
}
