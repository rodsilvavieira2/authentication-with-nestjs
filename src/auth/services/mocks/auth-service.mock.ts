/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthLoginDTO } from '@src/auth/dto';
import { Payload } from '@src/auth/types';

const USER_MOCK = {
  id: '1',
  name: 'any_name',
  email: 'any_email@email.com',
};

const SESSION_TOKENS_MOCK = {
  accessToken: 'ACCESS_TOKEN',
  refreshToken: 'REFRESH_TOKEN',
};

export class AuthServiceMOCK {
  async validateUser({}: AuthLoginDTO) {
    return USER_MOCK;
  }

  async findUserByPayload({ id }: Payload) {
    return {
      ...USER_MOCK,
      id,
    };
  }

  async generateTokens(data: any) {
    return data;
  }

  createRefreshToken({ email, id, name }: Payload) {
    return 'REFRESH_TOKEN';
  }

  async revalidateWithRefreshToken(token: string) {
    return SESSION_TOKENS_MOCK;
  }

  async login(authLoginDTO: AuthLoginDTO) {
    return SESSION_TOKENS_MOCK;
  }

  async googleAuth(data: any) {
    return data;
  }
}
