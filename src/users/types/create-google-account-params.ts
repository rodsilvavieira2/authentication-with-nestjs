import { User } from '../user.entity';

export type CreateGoogleAccountParams = Pick<
  User,
  'name' | 'email' | 'avatarUrl'
>;
