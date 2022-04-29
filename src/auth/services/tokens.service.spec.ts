import faker from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { TokensRepositoryMOCK } from './mocks';
import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let service: TokensService;
  let tokensRepository: TokensRepositoryMOCK;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: 'TokenRepository', useClass: TokensRepositoryMOCK },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
    tokensRepository = module.get('TokenRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('METHOD: create', () => {
    const params = {
      token: faker.datatype.uuid(),
      userId: faker.datatype.uuid(),
      expiresIn: faker.date.past(),
    };
    it('should create a new token', async () => {
      const result = await service.create(params);

      expect(result).toEqual(expect.objectContaining(params));
    });

    it('should call the create method with correct params', async () => {
      const createSpy = jest.spyOn(tokensRepository, 'create');

      await service.create(params);

      const { expiresIn, token, userId } = params;

      expect(createSpy).toHaveBeenCalledWith({
        expiresIn,
        token,
        user: {
          id: userId,
        },
      });
    });

    it('should call the save method with correct params', async () => {
      const newTokenData = {
        token: 'any-token',
      };

      jest
        .spyOn(tokensRepository, 'create')
        .mockReturnValue(newTokenData as any);

      const saveSpy = jest.spyOn(tokensRepository, 'save');

      await service.create(params);

      expect(saveSpy).toBeCalledWith(newTokenData);
    });

    it('should throw if the create method throw', async () => {
      jest.spyOn(tokensRepository, 'create').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(service.create(params)).rejects.toThrow();
    });

    it('should throws if the save method throws', async () => {
      jest.spyOn(tokensRepository, 'save').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(service.create(params)).rejects.toThrow();
    });
  });

  describe('METHOD: findByToken', () => {
    const params = 'any-token';
    const userId = 'any_user_id';

    it('should find token token', async () => {
      await tokensRepository.save({ token: params, userId } as any);

      const result = await service.findByToken(params);

      expect(result).toEqual(
        expect.objectContaining({
          token: params,
          userId,
        }),
      );
    });

    it('should call the finOne method with correct params', async () => {
      const finOneSpy = jest.spyOn(tokensRepository, 'findOne');

      await service.findByToken(params);

      expect(finOneSpy).toHaveBeenCalledWith({
        where: {
          token: params,
        },
        relations: ['user'],
      });
    });

    it('should throw if the findOne method throw', async () => {
      jest.spyOn(tokensRepository, 'findOne').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(service.findByToken(params)).rejects.toThrow();
    });
  });

  describe('METHOD: findByUserId', () => {
    const params = 'any_user_id';
    const userId = 'any_user_id';

    it('should find token token', async () => {
      await tokensRepository.save({ token: params, userId } as any);

      const result = await service.findByUserId(params);

      expect(result).toEqual(
        expect.objectContaining({
          token: params,
          userId,
        }),
      );
    });

    it('should call the findOne params with correct params', async () => {
      const finOneSpy = jest.spyOn(tokensRepository, 'findOne');

      await service.findByUserId(params);

      expect(finOneSpy).toHaveBeenCalledWith({
        where: {
          user: {
            id: params,
          },
        },
      });
    });

    it('should throw if the findOne method throw', async () => {
      jest.spyOn(tokensRepository, 'findOne').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(service.findByUserId(params)).rejects.toThrow();
    });
  });

  describe('METHOD: deleteByToken', () => {
    const params = 'any_user_id';

    it('should delete by token', async () => {
      const result = await service.deleteByToken(params);

      expect(result).toBeFalsy();
    });

    it('should call the delete method with correct params', async () => {
      const deleteSpy = jest.spyOn(tokensRepository, 'delete');

      await service.deleteByToken(params);

      expect(deleteSpy).toHaveBeenCalledWith({
        token: params,
      });
    });

    it('should throw if the findOne method throw', async () => {
      jest.spyOn(tokensRepository, 'findOne').mockImplementation(() => {
        throw new Error('error');
      });

      await expect(service.findByUserId(params)).rejects.toThrow();
    });
  });
});
