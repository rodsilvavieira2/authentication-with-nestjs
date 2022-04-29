/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '../user.entity';

export function withOutPassword(user: User) {
  const { password, ...rest } = user;

  return rest;
}

export function removeNullValues(data: Record<string, unknown>) {
  const result = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v != null),
  );

  return result;
}
