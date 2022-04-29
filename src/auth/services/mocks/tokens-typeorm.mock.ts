import { Token } from '@src/auth/token.entity';
import { faker } from '@faker-js/faker';

export class TokensRepositoryMOCK {
  tokens: Token[] = [];

  create(params: Token) {
    const newItem = {
      id: faker.datatype.uuid(),
      userId: params.user.id,
      createdAt: faker.date.past(),
      updateAt: faker.date.past(),
      ...params,
    };

    return newItem;
  }

  async save(params: Token) {
    this.tokens.push(params);

    return params;
  }

  async findOne(params: any) {
    if (params.where.token) {
      return this.tokens.find((item) => item.token === params.where.token);
    }

    if (params.where.user.id) {
      return this.tokens.find((item) => item.userId === params.where.user.id);
    }
  }

  async delete(token: string) {
    this.tokens.filter((item) => item.token !== token);
  }
}
