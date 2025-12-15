import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CourseClass } from './course-class.entity.js';
import { Trimester } from './trimester.entity.js';
import { Note } from './note.entity.js';

export enum TestType {
  EXAM = 'exam',
  QUIZ = 'quiz',
  HOMEWORK = 'homework',
  PRACTICAL = 'practical',
  ORAL = 'oral',
}

@Entity('tests')
export class Test {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: TestType,
    default: TestType.EXAM,
  })
  type: TestType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @Column({ type: 'uuid' })
  trimesterId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Trimester, (trimester) => trimester.tests)
  @JoinColumn({ name: 'trimesterId' })
  trimester: Trimester;

  @OneToMany(() => Note, (note) => note.test)
  notes: Note[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
