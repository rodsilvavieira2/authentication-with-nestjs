import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTokenDTO } from '../dto';

import { Token } from '../token.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
  ) {}

  async create({ expiresIn, token, userId }: CreateTokenDTO) {
    const tokenEntity = this.tokensRepository.create({
      expiresIn,
      token,
      user: {
        id: userId,
      },
    });

    const result = await this.tokensRepository.save(tokenEntity);

    return result;
  }

  async findByToken(token: string) {
    const result = await this.tokensRepository.findOne({
      where: {
        token,
      },
      relations: ['user'],
    });

    return result;
  }

  async findByUserId(userId: string) {
    const result = await this.tokensRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    return result;
  }

  async deleteByToken(token: string) {
    await this.tokensRepository.delete({
      token,
    });
  }
}
