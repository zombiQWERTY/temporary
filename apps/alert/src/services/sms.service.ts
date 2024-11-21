import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { smsConfig } from '../config/sms.config';

export interface SmsAeroResponse {
  success: boolean;
  data: {
    id: number; //430125783,
    from: 'SMS Aero'; // 'SMS Aero',
    number: string; // '79803855640'
    text: string; // 'Some text 795683',
    status: number; // 0,
    extendStatus: 'queue'; // queue
    channel: string; // 'FREE SIGN',
    cost: number; // 3.59,
    dateCreate: number; // 1654625606,
    dateSend: number; // 1654625606
  };
  message: null | string;
}

@Injectable()
export class SMSService {
  constructor(
    @Inject(HttpService) private httpService: HttpService,
    @Inject(smsConfig.KEY)
    private sms: ConfigType<typeof smsConfig>,
  ) {}

  // @see https://smsaero.ru/description/api/
  async sendSms(phone: string, text: string): Promise<SmsAeroResponse> {
    const res = await firstValueFrom(
      this.httpService.post<SmsAeroResponse>(
        'https://gate.smsaero.ru/v2/sms/send',
        {
          number: phone,
          sign: 'SMS Aero',
          text,
        },
        {
          auth: {
            username: this.sms.login,
            password: this.sms.password,
          },
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return res.data;
  }
}
