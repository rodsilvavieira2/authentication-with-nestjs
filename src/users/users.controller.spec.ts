import faker from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { withOutPassword } from './helpers';
import { UserServiceMOCK } from './mocks';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;
  let USER_MOCK;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useClass: UserServiceMOCK,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);

    USER_MOCK = {
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      avatarUrl: faker.internet.avatar(),
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST: users', () => {
    it('should handle the request and create a new user', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createLocalUser');

      const result = await controller.create(USER_MOCK);

      expect(userService.createLocalUser).toBeCalled();

      delete USER_MOCK.password;

      expect(result).not.toHaveProperty('password');
    });
    it('should throw if the createLocalUser method throw', async () => {
      jest.spyOn(userService, 'createLocalUser').mockRejectedValue(new Error());

      await expect(controller.create(USER_MOCK)).rejects.toThrow();
    });
  });

  describe('GET: users', () => {
    it('should return all users', async () => {
      jest.spyOn(userService, 'findAll').mockResolvedValue([USER_MOCK]);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();

      expect(result).toEqual([USER_MOCK].map((item) => withOutPassword(item)));
    });
    it('should throw if the findAll method throw', async () => {
      jest.spyOn(userService, 'findAll').mockRejectedValue(new Error());

      await expect(controller.findAll()).rejects.toThrow();
    });
  });

  describe('GET: users/:id', () => {
    it('should return the user', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(USER_MOCK);

      const result = await controller.findOne(USER_MOCK.id);

      expect(userService.findOne).toHaveBeenCalledWith(USER_MOCK.id);

      expect(result).toEqual(withOutPassword(USER_MOCK));
    });

    it('should throw if the findOne method throw', async () => {
      jest.spyOn(userService, 'findOne').mockRejectedValue(new Error());

      await expect(controller.findOne(USER_MOCK.id)).rejects.toThrow();
    });
  });

  describe('PATCH: users/:id', () => {
    it('should update the user', async () => {
      jest.spyOn(userService, 'update').mockResolvedValue(USER_MOCK);

      const result = await controller.update(USER_MOCK.id, USER_MOCK);

      await controller.update(USER_MOCK.id, USER_MOCK);

      expect(result).toEqual(USER_MOCK);
    });

    it('should throw if the update method throw', async () => {
      jest.spyOn(userService, 'update').mockRejectedValue(new Error());

      await expect(
        controller.update(USER_MOCK.id, USER_MOCK),
      ).rejects.toThrow();
    });
  });

  describe('DELETE: users/:id', () => {
    it('should delete the user', async () => {
      jest.spyOn(userService, 'remove');

      const result = await controller.remove(USER_MOCK.id);

      expect(userService.remove).toHaveBeenCalledWith(USER_MOCK.id);

      expect(result).toBeFalsy();
    });

    it('should throw if the remove method throw', async () => {
      jest.spyOn(userService, 'remove').mockRejectedValue(new Error());

      await expect(controller.remove(USER_MOCK.id)).rejects.toThrow();
    });
  });
});
