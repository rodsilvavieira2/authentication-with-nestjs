import { Token } from '../auth/token.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AuthType {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    nullable: true,
  })
  password?: string;

  @Column({
    type: 'enum',
    enum: AuthType,
    default: AuthType.LOCAL,
  })
  authType: AuthType;

  @Column({
    nullable: true,
  })
  avatarUrl?: string;

  @OneToMany(() => Token, (token) => token.user)
  token: Token[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
