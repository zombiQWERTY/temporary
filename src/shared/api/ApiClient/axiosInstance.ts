import axios, { AxiosInstance } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL!;
const baseSSRURL = process.env.NEXT_PUBLIC_PRIVATE_API_URL!;

export const createAxiosInstance = (url: string): AxiosInstance => {
  return axios.create({
    baseURL: url,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
};

export const axiosInstance = createAxiosInstance(baseURL);
export const axiosGuestInstance = createAxiosInstance(baseURL);
export const axiosSSRInstance = createAxiosInstance(baseSSRURL);
