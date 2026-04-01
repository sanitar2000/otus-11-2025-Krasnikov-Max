import axios, { AxiosRequestConfig } from 'axios';
import config from '../config/config';

const axiosInstance = axios.create({
  baseURL: config.baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HttpClientResponse<T = any> {
  status: number;
  data: T;
}

class HttpClient {
  async post<T = any>(
    url: string,
    data: any,
    customConfig?: AxiosRequestConfig
  ): Promise<HttpClientResponse<T>> {
    try {
      const response = await axiosInstance.post<T>(url, data, customConfig);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
        };
      }
      throw error;
    }
  }

  async get<T = any>(
    url: string,
    customConfig?: AxiosRequestConfig
  ): Promise<HttpClientResponse<T>> {
    try {
      const response = await axiosInstance.get<T>(url, customConfig);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
        };
      }
      throw error;
    }
  }

  async delete<T = any>(
    url: string,
    customConfig?: AxiosRequestConfig
  ): Promise<HttpClientResponse<T>> {
    try {
      const response = await axiosInstance.delete<T>(url, customConfig);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
        };
      }
      throw error;
    }
  }

  async put<T = any>(
    url: string,
    data: any,
    customConfig?: AxiosRequestConfig
  ): Promise<HttpClientResponse<T>> {
    try {
      const response = await axiosInstance.put<T>(url, data, customConfig);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: error.response.status,
          data: error.response.data,
        };
      }
      throw error;
    }
  }
}

export default new HttpClient();
