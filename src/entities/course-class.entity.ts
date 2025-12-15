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
import { Course } from './course.entity.js';
import { ClassYear } from './class-year.entity.js';
import { Test } from './test.entity.js';

@Entity('course_classes')
export class CourseClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  courseId: string;

  @Column({ type: 'uuid' })
  classYearId: string;

  @Column({ type: 'uuid', nullable: true })
  teacherId: string;

  @Column({ type: 'int', nullable: true })
  hoursPerWeek: number;

  @Column({ type: 'int', default: 1 })
  coefficient: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Course, (course) => course.courseClasses)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => ClassYear, (classYear) => classYear.courseClasses)
  @JoinColumn({ name: 'classYearId' })
  classYear: ClassYear;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
