import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class AuthLoginDTO {
  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;
}
