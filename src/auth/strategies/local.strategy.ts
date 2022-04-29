import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-local';
import { AuthService } from '../services';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const { id, name, avatarUrl } = await this.authService.validateLocalUser({
      email,
      password,
    });

    return {
      id,
      name,
      email,
      avatarUrl,
    };
  }
}
