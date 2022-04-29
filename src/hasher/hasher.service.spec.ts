import { Test, TestingModule } from '@nestjs/testing';
import { HasherService } from './hasher.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('HasherService', () => {
  let service: HasherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HasherService],
    }).compile();

    service = module.get<HasherService>(HasherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a plaintext', async () => {
    const plaintext = 'test';
    const digest = 'digest';

    jest.spyOn(bcrypt, 'hash').mockImplementation(() => digest);

    const result = await service.hash(plaintext);

    expect(bcrypt.hash).toHaveBeenCalledWith(plaintext, 10);

    expect(result).toBe(digest);
  });
});
