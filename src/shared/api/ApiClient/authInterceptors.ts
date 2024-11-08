import {
  AxiosInstance,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios';
import { redirect } from 'next/navigation';
import { getSession } from 'next-auth/react';

import { auth } from '@/shared/auth';
import { axiosSSRInstance } from './axiosInstance';
import { extractAllErrorDetails } from './errorsHandler';

const getSessionToken = async (): Promise<string | null> => {
  try {
    const lastSession =
      typeof window !== 'undefined' ? await getSession() : await auth();

    return lastSession ? lastSession.tokens.accessToken : null;
  } catch (e) {
    return null;
  }
};

const setAuthHeader = async (
  config: InternalAxiosRequestConfig,
  token: string | null,
): Promise<InternalAxiosRequestConfig> => {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  config.headers['Authorization'] = token ? `Bearer ${token}` : null;

  return config;
};

export const setupRequestInterceptors = (
  instance: AxiosInstance,
  guest: boolean,
) => {
  instance.interceptors.request.use(async (config) => {
    if (guest) {
      return config;
    }

    const accessToken = await getSessionToken();
    return Promise.resolve(setAuthHeader(config, accessToken));
  });
};

const processResponseErrors = (data: any) => {
  const errors = extractAllErrorDetails(data);
  if (errors && errors.length > 0) {
    return { error: errors[0]?.message, errorList: errors };
  }

  return null;
};

export const setupResponseInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => {
      const errorDetails = processResponseErrors(response?.data);
      if (errorDetails) {
        return Promise.reject(errorDetails);
      }

      return response;
    },
    (error) => {
      const errorDetails = processResponseErrors(error.response?.data);
      return Promise.reject(errorDetails ? errorDetails : error);
    },
  );
};

interface FailedRequest {
  response: {
    config: AxiosRequestConfig;
  };
}

export class RefreshTokenError implements Error {
  message: string;
  name: string;
  constructor(message: string) {
    this.name = 'RefreshTokenError';
    this.message = message;
  }
}

export const refreshAuthLogic = async (failedRequest: FailedRequest) => {
  try {
    const { data } = await axiosSSRInstance.post('/auth/refresh', {}, {
      skipAuthRefresh: true,
    } as any);
    if (!data.ok) {
      throw new RefreshTokenError('Server side redirect should be here');
    }

    const { accessToken } = data.data;

    failedRequest.response.config.headers = {
      ...failedRequest.response.config.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    return Promise.resolve();
  } catch (error) {
    if (error instanceof RefreshTokenError) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
        return;
      }

      return redirect('/');
    }
  }
};
