import { User } from '@src/users/user.entity';

export type Payload = Pick<User, 'name' | 'email' | 'avatarUrl' | 'id'>;
