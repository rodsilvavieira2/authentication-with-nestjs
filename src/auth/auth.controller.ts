/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ValidationPipe } from '../pipes/validation.pipe';
import { AuthLoginDTO } from './dto';

import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { GoogleAuthGuard, LocalAuthGuard } from './guards';
import { AuthService } from './services';
import { Profile } from './types';

@Controller('auth')
@ApiTags('Autenticação')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Faz a autenticação do usuário a partir de email e senha.',
  })
  @ApiBody({ type: AuthLoginDTO })
  @Post('password')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request) {
    const { user } = req;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.authService.generateTokens(user as any);
  }

  @ApiOperation({
    summary: 'Criar um novo access token a partir de um refresh token.',
  })
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Body(new ValidationPipe()) { token }: RefreshTokenDTO) {
    const result = await this.authService.revalidateWithRefreshToken(token);

    return result;
  }

  @ApiOperation({
    summary:
      'Incializa o processo de autenticação do usuário a partir do Google.',
  })
  @Get('/social/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @ApiOperation({
    summary:
      'Recebe o token de autenticação do Google. E retorna a página de perfil.',
  })
  @UseGuards(GoogleAuthGuard)
  @Get('/social/google/callback')
  @Render('index')
  async googleAuthRedirect(@Req() req: Request) {
    const { user } = req;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.authService.googleAuth(user as Profile);

    const { avatarUrl, email, name } = user as Profile;

    return {
      avatarUrl,
      email,
      name,
    };
  }
}
