import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy, JwtStrategy, LocalStrategy } from './strategies';
import { AuthService, TokensService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { HasherService } from '@src/hasher/hasher.service';
import { UuidService } from '@src/uuid/uuid.service';
import { DateService } from '@src/date/date.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Token]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: config.get('JWT_EXPIRATION_TIME') },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokensService,
    LocalStrategy,
    GoogleStrategy,
    HasherService,
    UuidService,
    DateService,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
