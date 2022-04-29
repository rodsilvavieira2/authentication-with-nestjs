import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';

@Injectable()
export class UuidService {
  getV4() {
    return uuid.v4();
  }
}
