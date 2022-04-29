import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HasherService } from '@src/hasher/hasher.service';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto';
import { removeNullValues, withOutPassword } from './helpers';
import {
  CreateGoogleAccountParams,
  CreateLocalUserServiceParams,
} from './types';

import { AuthType, User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hasherService: HasherService,
  ) {}

  async createOrFindGoogleAccount({
    email,
    name,
    avatarUrl,
  }: CreateGoogleAccountParams) {
    const userOnDb = await this.usersRepository.findOne({
      where: { email },
    });

    if (userOnDb) {
      if (userOnDb.authType === AuthType.LOCAL) {
        throw new BadRequestException('Email already exists');
      }

      return userOnDb;
    }

    const user = this.usersRepository.create({
      email,
      name,
      avatarUrl,
      authType: AuthType.GOOGLE,
    });

    const result = await this.usersRepository.save(user);

    return result;
  }

  async createLocalUser({
    email,
    name,
    password,
    avatarUrl,
  }: CreateLocalUserServiceParams) {
    const alreadyHaveSameEmail = await this.usersRepository.findOne({
      where: { email },
    });

    if (alreadyHaveSameEmail) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hasherService.hash(password);

    const user = this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      avatarUrl,
      authType: AuthType.LOCAL,
    });

    const result = await this.usersRepository.save(user);

    return result;
  }

  async findAll() {
    const result = await this.usersRepository.find();

    return result;
  }

  async findOne(id: string) {
    const result = await this.usersRepository.findOne(id);

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return result;
  }

  async findByEmail(email: string) {
    const result = await this.usersRepository.findOne({ where: { email } });

    return result;
  }

  async update(id: string, { avatarUrl, email, name }: UpdateUserDto) {
    const data = removeNullValues({ avatarUrl, email, name });

    const result = await this.usersRepository.update(id, data);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    const newData = await this.usersRepository.findOne(id);

    return withOutPassword(newData);
  }

  async remove(id: string) {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
