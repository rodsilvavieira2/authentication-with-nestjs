import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HasherService {
  async hash(plaintext: string) {
    return bcrypt.hash(plaintext, 10);
  }

  async compare(plaintext: string, hashed: string) {
    return bcrypt.compare(plaintext, hashed);
  }
}
