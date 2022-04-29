import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class DateService {
  getNow() {
    return dayjs().toDate();
  }

  isBefore(start: Date, end: Date) {
    return dayjs(start).isBefore(end);
  }

  addDays(days: number) {
    return dayjs().add(days, 'day').toDate();
  }
}
