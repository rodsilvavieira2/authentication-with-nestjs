import { Test, TestingModule } from '@nestjs/testing';
import { UuidService } from './uuid.service';
import * as uuid from 'uuid';
import faker from '@faker-js/faker';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('UuidService', () => {
  let service: UuidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UuidService],
    }).compile();

    service = module.get<UuidService>(UuidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should gen a v4 uuid', () => {
    const uuidToken = faker.datatype.uuid();

    jest.spyOn(uuid, 'v4').mockReturnValue(uuidToken);

    const result = service.getV4();

    expect(uuid.v4).toBeCalled();

    expect(result).toBe(uuidToken);
  });
});
