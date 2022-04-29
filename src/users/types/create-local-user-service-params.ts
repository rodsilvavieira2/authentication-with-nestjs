import { User } from '../user.entity';

export type CreateLocalUserServiceParams = Pick<
  User,
  'email' | 'password' | 'name' | 'avatarUrl'
>;
