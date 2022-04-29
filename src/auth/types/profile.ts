import { User } from '@src/users/user.entity';

export type Profile = Pick<User, 'email' | 'name' | 'avatarUrl'>;
