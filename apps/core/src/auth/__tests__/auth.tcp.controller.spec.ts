import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { mock, MockProxy } from 'jest-mock-extended';

import { AuthTcpController } from '../auth.tcp.controller';
import { AuthCommonService } from '../auth.common.service';

describe('AuthTcpController', () => {
  let controller: AuthTcpController;
  let authCommonService: MockProxy<AuthCommonService>;

  beforeEach(async () => {
    authCommonService = mock<AuthCommonService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthTcpController],
      providers: [{ provide: AuthCommonService, useValue: authCommonService }],
    }).compile();

    controller = module.get<AuthTcpController>(AuthTcpController);
  });

  describe('AuthTcpController: findCredentials', () => {
    it('should successfully return credentials', async () => {
      const dto = { userId: 1 };
      const expectedResponse = { email: '123', phone: '123' };

      authCommonService.findCredentials.mockResolvedValue(expectedResponse);

      const result = await controller.findCredentials(dto);
      expect(result).toEqual(expectedResponse);
      expect(authCommonService.findCredentials).toHaveBeenCalledWith(
        dto.userId,
      );
    });

    it('should throw RpcException when there is an error sending SMS code', async () => {
      const dto = { userId: 1 };
      const error = new RpcException('Unable to find credentials');

      authCommonService.findCredentials.mockRejectedValue(error);

      await expect(controller.findCredentials(dto)).rejects.toThrow(
        RpcException,
      );
    });
  });
});
