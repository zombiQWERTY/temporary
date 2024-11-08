import { AxiosInstance, AxiosRequestConfig } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { z } from 'zod';
import {
  refreshAuthLogic,
  setupRequestInterceptors,
  setupResponseInterceptors,
} from './authInterceptors';
import { axiosInstance, axiosGuestInstance } from './axiosInstance';
import { validateResponse, prepareRequestBody } from './validateRequest';

interface ApiClientParams {
  guest: boolean;
}

const requestWithBody = async <
  Req extends z.ZodTypeAny,
  Res extends z.ZodTypeAny,
>(
  instance: AxiosInstance,
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string,
  body: { dto: z.infer<Req>; schema: Req; responseSchema: Res },
  config?: AxiosRequestConfig,
): Promise<z.infer<Res>> => {
  const isFormDataRequest =
    config?.headers?.['Content-Type'] === 'multipart/form-data';

  const dto = isFormDataRequest ? body.dto : prepareRequestBody(body, url);

  const res = await instance[method]<Res>(url, dto, config).then((r) => r.data);

  return validateResponse(res, body.responseSchema, url);
};

const ApiClient = (params: ApiClientParams = { guest: false }) => {
  const instance = params.guest ? axiosGuestInstance : axiosInstance;

  setupRequestInterceptors(instance, params.guest);
  setupResponseInterceptors(instance);

  if (!params.guest) {
    createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
      pauseInstanceWhileRefreshing: false,
      retryInstance: axiosInstance,
    });
  }

  return {
    get: async <Res extends z.ZodTypeAny>(
      url: string,
      extra: { responseSchema: Res },
      config?: AxiosRequestConfig<Res>,
    ): Promise<z.infer<Res>> => {
      const res = await instance.get<Res>(url, config).then((r) => r.data);
      return validateResponse(res, extra.responseSchema, url);
    },

    post: <Req extends z.ZodTypeAny, Res extends z.ZodTypeAny>(
      url: string,
      body: { dto: z.infer<Req>; schema: Req; responseSchema: Res },
      config?: AxiosRequestConfig<Res>,
    ): Promise<z.infer<Res>> =>
      requestWithBody(instance, 'post', url, body, config),

    put: <Req extends z.ZodTypeAny, Res extends z.ZodTypeAny>(
      url: string,
      body: { dto: z.infer<Req>; schema: Req; responseSchema: Res },
      config?: AxiosRequestConfig<Res>,
    ): Promise<z.infer<Res>> =>
      requestWithBody(instance, 'put', url, body, config),

    patch: <Req extends z.ZodTypeAny, Res extends z.ZodTypeAny>(
      url: string,
      body: { dto: z.infer<Req>; schema: Req; responseSchema: Res },
      config?: AxiosRequestConfig<Res>,
    ): Promise<z.infer<Res>> =>
      requestWithBody(instance, 'patch', url, body, config),

    delete: async <Req extends never, Res extends z.ZodTypeAny>(
      url: string,
      body: { dto: Req; schema: Req; responseSchema: Res },
      config?: AxiosRequestConfig,
    ): Promise<z.infer<Res>> =>
      requestWithBody(instance, 'delete', url, body, config),
  };
};

export const apiClient = ApiClient({ guest: false });
export const apiClientGuest = ApiClient({ guest: true });
