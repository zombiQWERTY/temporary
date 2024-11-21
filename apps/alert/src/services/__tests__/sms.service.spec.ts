import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { SMSService, SmsAeroResponse } from '../sms.service';
import { smsConfig } from '../../config/sms.config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigType } from '@nestjs/config';

describe('SMSService', () => {
  let smsService: SMSService;
  let httpService: HttpService;
  let smsConfigMock: ConfigType<typeof smsConfig>;

  beforeEach(async () => {
    smsConfigMock = {
      login: 'testLogin',
      password: 'testPassword',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SMSService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: smsConfig.KEY,
          useValue: smsConfigMock,
        },
      ],
    }).compile();

    smsService = module.get<SMSService>(SMSService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(smsService).toBeDefined();
  });

  describe('sendSms', () => {
    it('should send SMS and return the correct response', async () => {
      const phone = '79803855640';
      const text = 'Test message';

      const mockResponse: AxiosResponse<SmsAeroResponse> = {
        data: {
          success: true,
          data: {
            id: 1,
            from: 'SMS Aero',
            number: phone,
            text,
            status: 0,
            extendStatus: 'queue',
            channel: 'FREE SIGN',
            cost: 3.59,
            dateCreate: 1654625606,
            dateSend: 1654625606,
          },
          message: null,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      // Mock the httpService.post to return an observable of mockResponse
      (httpService.post as jest.Mock).mockReturnValue(of(mockResponse));

      const result = await smsService.sendSms(phone, text);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://gate.smsaero.ru/v2/sms/send',
        {
          number: phone,
          sign: 'SMS Aero',
          text,
        },
        {
          auth: {
            username: smsConfigMock.login,
            password: smsConfigMock.password,
          },
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle HTTP errors', async () => {
      const phone = '79803855640';
      const text = 'Test message';

      // Mock an error response using throwError to simulate an Observable throwing an error
      const mockError = new Error('HTTP error');
      (httpService.post as jest.Mock).mockReturnValue(throwError(mockError));

      await expect(smsService.sendSms(phone, text)).rejects.toThrow(
        'HTTP error',
      );
    });
  });
});
