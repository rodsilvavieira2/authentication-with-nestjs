import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RefreshTokenDTO {
  @IsUUID()
  @ApiProperty()
  token: string;
}
