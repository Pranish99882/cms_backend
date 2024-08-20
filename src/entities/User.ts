import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import bcrypt from 'bcryptjs';

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ nullable: true})
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true})
  passwordResetToken: string | null;


  @Column({ type: 'timestamp', nullable: true, default: null}) 
  passwordResetExpires: Date | null;

  @Column({ default: true }) 
  passwordSet: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  roleNames: string;

  @Column("simple-array") 
  permissionNames: string[];


  async setPassword(password: string) {
    this.password = await bcrypt.hash(password, 12);
    this.passwordSet = true;
  }
}
