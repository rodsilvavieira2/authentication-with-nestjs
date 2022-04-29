import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { AuthLoginDTO } from '../dto/auth-login.dto';

import { TokensService } from './tokens.service';
import { Payload, Profile } from '../types';
import { AuthType } from '@src/users/user.entity';
import { DateService } from '@src/date/date.service';
import { UuidService } from '@src/uuid/uuid.service';
import { HasherService } from '@src/hasher/hasher.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly jwtService: JwtService,
    private readonly dateService: DateService,
    private readonly uuidService: UuidService,
    private readonly hasherService: HasherService,
  ) {}

  async validateLocalUser({ email, password }: AuthLoginDTO) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('email or password is incorrect');
    }

    if (user.authType !== AuthType.LOCAL) {
      throw new BadRequestException({
        message: `user's auth type is not local, current auth type is ${user.authType}`,
        currentAuthType: user.authType,
        error: 'Bad Request',
      });
    }

    const isPasswordMatched = await this.hasherService.compare(
      password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('email or password is incorrect');
    }

    return user;
  }

  async findUserByPayload({ id }: Payload) {
    if (id) {
      const result = await this.usersService.findOne(id);

      return result;
    }

    return null;
  }

  async saveRefreshToken(token: string, userId: string) {
    const expiresIn = this.dateService.addDays(
      Number(process.env.JWT_REFRESH_EXPIRATION_TIME_IN_DAYS),
    );

    const result = await this.tokensService.create({
      expiresIn,
      token,
      userId,
    });

    return result;
  }

  async generateTokens({ email, id, name, avatarUrl }: Payload) {
    const refreshToken = this.uuidService.getV4();

    await this.saveRefreshToken(refreshToken, id);

    const accessToken = this.jwtService.sign({
      email,
      id,
      name,
      avatarUrl,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async googleAuth({ avatarUrl, email, name }: Profile) {
    const { id } = await this.usersService.createOrFindGoogleAccount({
      email,
      name,
      avatarUrl,
    });

    const { accessToken, refreshToken } = await this.generateTokens({
      email,
      id,
      name,
      avatarUrl,
    });

    return {
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        id,
        name,
        email,
        avatarUrl,
      },
    };
  }

  async revalidateWithRefreshToken(token: string) {
    const result = await this.tokensService.findByToken(token);

    if (!result) {
      throw new NotFoundException('refresh token not found');
    }

    const now = this.dateService.getNow();

    const isBefore = this.dateService.isBefore(result.expiresIn, now);

    if (isBefore) {
      throw new NotFoundException('refresh token expired');
    }

    await this.tokensService.deleteByToken(token);

    const { name, email, id } = result.user;

    const payload = {
      email,
      id,
      name,
    };

    const refreshToken = this.uuidService.getV4();

    const expiresIn = this.dateService.addDays(
      Number(process.env.JWT_REFRESH_EXPIRATION_TIME_IN_DAYS),
    );

    await this.tokensService.create({
      token: refreshToken,
      userId: id,
      expiresIn,
    });

    const accessToken = this.jwtService.sign(payload);

    return {
      refreshToken,
      accessToken,
    };
  }
}
