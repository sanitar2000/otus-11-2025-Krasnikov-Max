import httpClient from './httpClient';
import config from '../config/config';

// Типы для данных пользователя
interface UserData {
  userName: string;
  password: string;
}

interface Credentials {
  userName: string;
  password: string;
}

interface ApiResponse<T = any> {
  status: number;
  data: T;
}

interface UserResponse {
  userID?: string;
  userId?: string;
  username?: string;
  userName?: string;
  token?: string;
  status?: string;
  message?: string;
  books?: any[];
}

interface Endpoints {
  authorized: string;
  generateToken: string;
  user: string;
}

class AccountController {
  private endpoints: Endpoints;

  constructor() {
    this.endpoints = config.endpoints.account;
  }

  async createUser(userData: UserData): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await httpClient.post<UserResponse>(this.endpoints.user, userData);
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

  async generateToken(credentials: Credentials): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await httpClient.post<UserResponse>(
        this.endpoints.generateToken,
        credentials
      );
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

  async authorizeUser(credentials: Credentials): Promise<ApiResponse<boolean | UserResponse>> {
    try {
      const response = await httpClient.post<boolean | UserResponse>(
        this.endpoints.authorized,
        credentials
      );
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

  async getUser(userId: string, token: string | null): Promise<ApiResponse<UserResponse>> {
    try {
      const options = token
        ? {
            headers: { Authorization: `Bearer ${token}` },
          }
        : {};

      const response = await httpClient.get<UserResponse>(
        `${this.endpoints.user}/${userId}`,
        options
      );
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

  async deleteUser(userId: string, token: string | null): Promise<ApiResponse<void>> {
    try {
      const options = token
        ? {
            headers: { Authorization: `Bearer ${token}` },
          }
        : {};

      const response = await httpClient.delete<void>(`${this.endpoints.user}/${userId}`, options);
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

export default AccountController;
