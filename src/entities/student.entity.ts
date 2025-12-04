import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StudentInscription } from './student-inscription.entity.js';
import { Note } from './note.entity.js';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  registrationNumber: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  placeOfBirth: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parentName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  parentPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  parentEmail: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => StudentInscription, (inscription) => inscription.student)
  inscriptions: StudentInscription[];

  @OneToMany(() => Note, (note) => note.student)
  notes: Note[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
