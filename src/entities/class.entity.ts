import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ClassYear } from './class-year.entity.js';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  childClassId: string;

  @OneToMany(() => ClassYear, (classYear) => classYear.class)
  classYears: ClassYear[];

  // A class can have one child class (next level)
  @OneToOne(() => Class, (classEntity) => classEntity.parentClass, { nullable: true })
  @JoinColumn({ name: 'childClassId' })
  childClass: Class;

  // A class can be the child of many parent classes
  @ManyToOne(() => Class, (classEntity) => classEntity.childClass, { nullable: true })
  parentClass: Class;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
