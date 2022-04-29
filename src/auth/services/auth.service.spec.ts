import faker from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceMOCK } from '../../users/mocks';
import { UsersService } from '../../users/users.service';
import { AuthService } from './auth.service';
import { JwtServiceMOCK, TokensServiceMOCK } from './mocks';
import * as bcrypt from 'bcrypt';
import { TokensService } from './tokens.service';
import { AuthType } from '@src/users/user.entity';
import { DateService } from '@src/date/date.service';
import { UuidService } from '@src/uuid/uuid.service';
import { HasherService } from '@src/hasher/hasher.service';
import { DateServiceMOCK } from '@src/date/mocks';
import { UuidServiceMOCK } from '@src/uuid/mocks';
import { HasherServiceMOCK } from '@src/hasher/mocks';

jest.mock('dayjs', () =>
  jest.fn().mockReturnValue({
    add: jest.fn().mockReturnValue({ toDate: jest.fn() }),
    isBefore: jest.fn().mockReturnValue(false),
  }),
);

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const USER_MOCK = {
  id: faker.datatype.uuid(),
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  avatarUrl: faker.internet.avatar(),
  authType: AuthType.LOCAL,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let tokensService: TokensService;
  let jwtService: JwtService;
  let dateService: DateService;
  let uuidService: UuidService;
  let hasherService: HasherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useClass: UserServiceMOCK,
        },
        {
          provide: JwtService,
          useClass: JwtServiceMOCK,
        },
        {
          provide: TokensService,
          useClass: TokensServiceMOCK,
        },
        {
          provide: DateService,
          useClass: DateServiceMOCK,
        },
        {
          provide: UuidService,
          useClass: UuidServiceMOCK,
        },
        {
          provide: HasherService,
          useClass: HasherServiceMOCK,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    tokensService = module.get<TokensService>(TokensService);
    dateService = module.get<DateService>(DateService);
    uuidService = module.get<UuidService>(UuidService);
    hasherService = module.get<HasherService>(HasherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('METHOD: validateLocalUser', () => {
    let params;

    beforeEach(() => {
      params = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
    });

    it('should validate a user', async () => {
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(USER_MOCK as any);

      jest.spyOn(hasherService, 'compare');

      const result = await service.validateLocalUser(params);

      expect(usersService.findByEmail).toBeCalledWith(params.email);

      expect(hasherService.compare).toBeCalledWith(
        params.password,
        USER_MOCK.password,
      );

      expect(result).toEqual(USER_MOCK);
    });

    it('should throw if not find a user by email', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.validateLocalUser(params)).rejects.toThrow();
    });

    it('should throw if find the user but the auth type is not local', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        ...USER_MOCK,
        authType: AuthType.GOOGLE,
      } as any);

      expect(service.validateLocalUser(params)).rejects.toThrow();
    });

    it('should throw if the passwords not match', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      expect(service.validateLocalUser(params)).rejects.toThrow();
    });
  });

  describe('METHOD: findUserByPayload', () => {
    it('should find a user by payload', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(USER_MOCK as any);

      const result = await service.findUserByPayload(USER_MOCK);

      expect(usersService.findOne).toBeCalledWith(USER_MOCK.id);

      expect(result).toEqual(USER_MOCK);
    });
  });

  describe('METHOD: saveRefreshToken', () => {
    let params;

    beforeEach(() => {
      params = {
        token: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
      };
    });

    it('should save the given refresh token', async () => {
      const expiresIn = new Date();

      const tokenData = {
        data: 'any_data',
      };

      jest.spyOn(tokensService, 'create').mockResolvedValue(tokenData as any);
      jest.spyOn(dateService, 'addDays').mockReturnValue(expiresIn);

      process.env.JWT_REFRESH_EXPIRATION_TIME_IN_DAYS = '10';

      const result = await service.saveRefreshToken(
        params.token,
        params.userId,
      );

      expect(tokensService.create).toBeCalledWith({
        expiresIn,
        token: params.token,
        userId: params.userId,
      });

      expect(result).toEqual(tokenData);
    });
  });

  describe('METHOD: generateTokens', () => {
    let params;

    beforeEach(() => {
      params = {
        email: faker.internet.email(),
        id: faker.datatype.uuid(),
        name: faker.name.findName(),
        avatarUrl: faker.internet.avatar(),
      };
    });

    it('should generate auth tokens', async () => {
      const refreshToken = faker.datatype.uuid();
      const accessToken = faker.datatype.uuid();

      jest.spyOn(uuidService, 'getV4').mockReturnValue(refreshToken);

      jest.spyOn(service, 'saveRefreshToken');

      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await service.generateTokens(params);

      expect(uuidService.getV4).toBeCalled();

      expect(service.saveRefreshToken).toBeCalledWith(refreshToken, params.id);

      expect(jwtService.sign).toBeCalledWith(params);

      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
    });
  });

  describe('METHOD: googleAuth', () => {
    let params;

    beforeEach(() => {
      params = {
        email: faker.internet.email(),
        name: faker.name.findName(),
        avatarUrl: faker.internet.avatar(),
      };
    });

    it('should authenticate a user by google auth provider', async () => {
      jest
        .spyOn(usersService, 'createOrFindGoogleAccount')
        .mockResolvedValue(USER_MOCK as any);

      const accessToken = faker.datatype.uuid();
      const refreshToken = faker.datatype.uuid();

      jest.spyOn(service, 'generateTokens').mockResolvedValue({
        accessToken,
        refreshToken,
      });

      const result = await service.googleAuth(params);

      const { id } = USER_MOCK;

      expect(usersService.createOrFindGoogleAccount).toBeCalledWith(params);

      expect(service.generateTokens).toBeCalledWith({
        id,
        ...params,
      });

      expect(result).toEqual({
        tokens: {
          accessToken,
          refreshToken,
        },
        user: {
          id,
          ...params,
        },
      });
    });
  });

  describe('METHOD: revalidateWithRefreshToken', () => {
    let params;

    beforeEach(() => {
      params = faker.datatype.uuid();
    });

    it('should generate news auth tokens given a refresh token', async () => {
      const TOKEN_DATA = {
        expiresIn: faker.date.future(),
        user: {
          name: faker.name.findName(),
          id: faker.datatype.uuid(),
          email: faker.internet.email(),
        },
      };

      jest
        .spyOn(tokensService, 'findByToken')
        .mockResolvedValue(TOKEN_DATA as any);

      const now = faker.date.past();

      const expiresIn = faker.date.future();

      const refreshToken = faker.datatype.uuid();
      const accessToken = faker.datatype.uuid();

      process.env.JWT_REFRESH_EXPIRATION_TIME_IN_DAYS = '10';

      jest.spyOn(dateService, 'getNow').mockReturnValue(now);

      jest.spyOn(dateService, 'isBefore').mockReturnValue(false);

      jest.spyOn(tokensService, 'deleteByToken');

      jest.spyOn(uuidService, 'getV4').mockReturnValue(refreshToken);

      jest.spyOn(dateService, 'addDays').mockReturnValue(expiresIn);

      jest.spyOn(tokensService, 'create');

      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await service.revalidateWithRefreshToken(params);

      expect(tokensService.findByToken).toBeCalledWith(params);

      expect(dateService.getNow).toBeCalled();

      expect(dateService.isBefore).toBeCalledWith(TOKEN_DATA.expiresIn, now);

      expect(tokensService.deleteByToken).toBeCalledWith(params);

      expect(uuidService.getV4).toBeCalled();

      expect(dateService.addDays).toBeCalledWith(10);

      expect(tokensService.create).toBeCalledWith({
        expiresIn,
        token: refreshToken,
        userId: TOKEN_DATA.user.id,
      });

      expect(jwtService.sign).toBeCalledWith(TOKEN_DATA.user);

      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
    });

    it('should throw if not find the token', async () => {
      jest.spyOn(tokensService, 'findByToken').mockResolvedValue(null);

      expect(service.revalidateWithRefreshToken(params)).rejects.toThrow();
    });

    it('should throw if the refresh toke is expired', async () => {
      jest.spyOn(dateService, 'isBefore').mockReturnValue(true);

      expect(service.revalidateWithRefreshToken(params)).rejects.toThrow();
    });
  });
});
