import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({})
  name: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false })
  avatarUrl?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ required: false })
  email?: string;
}
