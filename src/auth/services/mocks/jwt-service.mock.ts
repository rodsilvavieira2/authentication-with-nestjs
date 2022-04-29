import faker from '@faker-js/faker';

/* eslint-disable @typescript-eslint/no-unused-vars */
const PAYLOAD = {
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  name: faker.name.findName(),
};

export class JwtServiceMOCK {
  sign(payload: any, options?: any): string {
    return 'token';
  }

  verify(token: string): any {
    return PAYLOAD;
  }

  decode(token: string): any {
    return PAYLOAD;
  }
}
