import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  name: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ required: false })
  avatarUrl?: string;

  @MinLength(6)
  @IsString()
  @IsOptional()
  @ApiProperty({ minLength: 6 })
  password?: string;
}
