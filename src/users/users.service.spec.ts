import faker from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { HasherService } from '@src/hasher/hasher.service';
import { HasherServiceMOCK } from '@src/hasher/mocks';
import { UserTypeormMOCK } from './mocks';
import { AuthType } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UserTypeormMOCK;
  let USER_MOCK;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'UserRepository', useClass: UserTypeormMOCK },
        { provide: HasherService, useClass: HasherServiceMOCK },
      ],
      imports: [HasherService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get('UserRepository');

    USER_MOCK = {
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('METHOD: createLocalUser ', () => {
    it('should create a new local user', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      jest.spyOn(usersRepository, 'create').mockReturnValue(USER_MOCK);

      jest.spyOn(usersRepository, 'save').mockReturnValue(USER_MOCK);

      const result = await service.createLocalUser(USER_MOCK);

      expect(usersRepository.findOne).toBeCalledWith({
        where: { email: USER_MOCK.email },
      });

      const { name, email, avatarUrl } = USER_MOCK;

      expect(usersRepository.create).toBeCalledWith({
        name,
        email,
        password: 'hash',
        avatarUrl,
        authType: AuthType.LOCAL,
      });

      expect(usersRepository.save).toBeCalledWith(USER_MOCK);

      expect(result).toEqual(USER_MOCK);
    });

    it('should throw if already have a user with the same email', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(USER_MOCK);

      expect(service.createLocalUser(USER_MOCK)).rejects.toThrow();
    });
  });

  describe('METHOD: findAll ', () => {
    it('should return all users', async () => {
      jest.spyOn(usersRepository, 'find').mockResolvedValue([USER_MOCK]);

      const result = await service.findAll();

      expect(usersRepository.find).toHaveBeenCalled();

      expect(result).toEqual([USER_MOCK]);
    });
  });

  describe('METHOD: findOne ', () => {
    it('should return a user', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(USER_MOCK);

      const result = await service.findOne(USER_MOCK.id);

      expect(usersRepository.findOne).toHaveBeenCalledWith(USER_MOCK.id);

      expect(result).toEqual(USER_MOCK);
    });

    it('should throw if not find a user', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      expect(service.findOne(USER_MOCK.id)).rejects.toThrow();
    });
  });

  describe('METHOD: update ', () => {
    it('should  update a user', async () => {
      const params = {
        name: USER_MOCK.name,
        email: USER_MOCK.email,
        avatarUrl: USER_MOCK.avatarUrl,
      };

      jest.spyOn(usersRepository, 'update');

      await service.update(USER_MOCK.id, params);

      expect(usersRepository.update).toHaveBeenCalledWith(USER_MOCK.id, params);
    });

    it('should throw if not find a user to update', async () => {
      jest.spyOn(usersRepository, 'update').mockResolvedValue({
        affected: 0,
      });

      expect(service.update(USER_MOCK.id, {})).rejects.toThrow();
    });
  });

  describe('METHOD: remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(usersRepository, 'delete').mockResolvedValue({
        affected: 1,
      } as any);

      await service.remove(USER_MOCK.id);

      expect(usersRepository.delete).toHaveBeenCalledWith(USER_MOCK.id);
    });

    it('should throw if not find a user to remove', async () => {
      jest.spyOn(usersRepository, 'delete').mockResolvedValue({
        affected: 0,
      } as any);

      expect(service.remove(USER_MOCK.id)).rejects.toThrow();
    });
  });

  describe('METHOD: createOrFindGoogleAccount', () => {
    it('should create a new google account', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      jest.spyOn(usersRepository, 'create').mockReturnValue(USER_MOCK);

      jest.spyOn(usersRepository, 'save').mockReturnValue(USER_MOCK);

      const result = await service.createOrFindGoogleAccount(USER_MOCK);

      expect(usersRepository.findOne).toBeCalledWith({
        where: { email: USER_MOCK.email },
      });

      const { name, email, avatarUrl } = USER_MOCK;

      expect(usersRepository.create).toBeCalledWith({
        name,
        email,
        avatarUrl,
        authType: AuthType.GOOGLE,
      });

      expect(usersRepository.save).toBeCalledWith(USER_MOCK);

      expect(result).toEqual(USER_MOCK);
    });

    it('should return the current google account', async () => {
      const localUserMock = {
        ...USER_MOCK,
        authType: AuthType.GOOGLE,
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(localUserMock);

      const result = await service.createOrFindGoogleAccount(localUserMock);

      expect(result).toEqual(localUserMock);
    });

    it('should throw if find a local account with the same email', async () => {
      const localUserMock = {
        ...USER_MOCK,
        authType: AuthType.LOCAL,
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(localUserMock);

      expect(
        service.createOrFindGoogleAccount(localUserMock),
      ).rejects.toThrow();
    });
  });
});
