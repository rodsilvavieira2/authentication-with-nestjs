import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DateService } from './date/date.service';
import { UuidService } from './uuid/uuid.service';
import { HasherService } from './hasher/hasher.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        ...(process.env.NODE_ENV === 'production' && {
          ssl: {
            rejectUnauthorized: false,
          },
        }),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  providers: [DateService, UuidService, HasherService],
})
export class AppModule {}
