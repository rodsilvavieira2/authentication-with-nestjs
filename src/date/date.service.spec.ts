import { Test, TestingModule } from '@nestjs/testing';
import { DateService } from './date.service';
import * as dayjs from 'dayjs';
import faker from '@faker-js/faker';

jest.mock('dayjs', () =>
  jest.fn().mockReturnValue({
    toDate: jest.fn(),
    isBefore: jest.fn(),
    add: jest.fn().mockReturnValue({
      toDate: jest.fn(),
    }),
  }),
);

describe('DateService', () => {
  let service: DateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateService],
    }).compile();

    service = module.get<DateService>(DateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get the current date', async () => {
    const now = new Date();

    jest.spyOn(dayjs(), 'toDate').mockReturnValue(now);

    const result = service.getNow();

    expect(result).toBe(now);
  });

  it('should  add days to the current date', async () => {
    const now = new Date();

    const toDateFn = jest.fn().mockReturnValue(now);

    jest.spyOn(dayjs(), 'add').mockReturnValue({
      toDate: toDateFn,
    } as any);

    const result = service.addDays(10);

    expect(dayjs().add).toHaveBeenCalledWith(10, 'day');
    expect(toDateFn).toBeCalled();

    expect(result).toBe(now);
  });

  it('verify if the date is before', async () => {
    const start = faker.date.past();
    const end = faker.date.future();

    jest.spyOn(dayjs(), 'isBefore').mockReturnValue(true);

    const result = service.isBefore(start, end);

    expect(dayjs).toBeCalled();

    expect(dayjs).toBeCalledWith(start);

    expect(dayjs().isBefore).toBeCalledWith(end);

    expect(result).toBeTruthy();
  });
});
