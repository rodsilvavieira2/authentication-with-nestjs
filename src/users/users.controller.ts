import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

import { withOutPassword } from './helpers';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ValidationPipe } from '../pipes/validation.pipe';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Usuários')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo usuário com o email e senha informados',
  })
  async create(
    @Body(new ValidationPipe())
    { email, name, avatarUrl, password }: CreateUserDto,
  ) {
    const result = await this.usersService.createLocalUser({
      email,
      name,
      avatarUrl,
      password,
    });

    return withOutPassword(result);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista os usuários existentes',
  })
  async findAll() {
    const result = await this.usersService.findAll();

    return result.map((item) => withOutPassword(item));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({
    summary: 'Pega dados de um usuário por id',
  })
  @ApiBearerAuth()
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.usersService.findOne(id);

    return withOutPassword(result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza dados do usuário por id',
  })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar um usuário por id',
  })
  @ApiBearerAuth()
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.remove(id);
  }
}
