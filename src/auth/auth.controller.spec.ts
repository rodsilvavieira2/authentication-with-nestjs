import faker from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { AuthServiceMOCK } from './services/mocks';
import { Profile } from './types';

const SESSION_TOKENS_MOCK = {
  accessToken: 'ACCESS_TOKEN',
  refreshToken: 'REFRESH_TOKEN',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useClass: AuthServiceMOCK,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST:/auth/login', () => {
    let params: Profile;

    beforeEach(() => {
      params = {
        email: faker.internet.email(),
        name: faker.name.findName(),
        avatarUrl: faker.internet.avatar(),
      };
    });

    it('should login the user', async () => {
      jest
        .spyOn(authService, 'generateTokens')
        .mockResolvedValue(SESSION_TOKENS_MOCK);

      const result = await controller.login({ user: params } as any);

      expect(authService.generateTokens).toHaveBeenCalledWith(params);

      expect(result).toEqual(SESSION_TOKENS_MOCK);
    });

    it('should throw if not have a user loaded on the requisition', async () => {
      expect(controller.login({} as any)).rejects.toThrow();
    });
  });

  describe('POST:/auth/refresh-token', () => {
    const params = {
      token: faker.datatype.uuid(),
    };

    it('should create news tokens', async () => {
      const revalidateWithRefreshTokenSpy = jest
        .spyOn(authService, 'revalidateWithRefreshToken')
        .mockResolvedValue(SESSION_TOKENS_MOCK);

      const result = await controller.refreshToken(params);

      expect(revalidateWithRefreshTokenSpy).toHaveBeenCalledWith(params.token);

      expect(result).toEqual(SESSION_TOKENS_MOCK);
    });
  });

  describe('GET:/auth/social/google/callback ', () => {
    it('should return the google profile data', async () => {
      const profile = {
        email: faker.internet.email(),
        name: faker.name.findName(),
        avatarUrl: faker.internet.avatar(),
      };

      jest.spyOn(authService, 'googleAuth');

      const result = await controller.googleAuthRedirect({
        user: profile,
      } as any);

      expect(authService.googleAuth).toHaveBeenCalledWith(profile);

      expect(result).toEqual(profile);
    });

    it('should throw if not have a user loaded on the requisition', async () => {
      expect(controller.googleAuthRedirect({} as any)).rejects.toThrow();
    });
  });
});
