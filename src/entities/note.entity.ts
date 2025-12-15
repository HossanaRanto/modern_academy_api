import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Student } from './student.entity.js';
import { Test } from './test.entity.js';
import { Course } from './course.entity.js';

@Entity('notes')
@Index(['studentId', 'testId'], { unique: true })
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  testId: string;

  @Column({ type: 'uuid'})
  courseId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20 })
  maxScore: number;

  @Column({ type: 'boolean', default: false })
  isAbsent: boolean;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'uuid', nullable: true })
  enteredBy: string;

  @Column({ type: 'timestamp', nullable: true })
  enteredAt: Date;

  @ManyToOne(() => Student, (student) => student.notes)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Test, (test) => test.notes)
  @JoinColumn({ name: 'testId' })
  test: Test;

  @ManyToOne(() => Course, (course) => course.notes)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
