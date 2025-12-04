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
import { Class } from './class.entity.js';
import { AcademicYear } from './academic-year.entity.js';
import { StudentInscription } from './student-inscription.entity.js';
import { CourseClass } from './course-class.entity.js';

@Entity('class_years')
export class ClassYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  classId: string;

  @Column({ type: 'uuid' })
  academicYearId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  section: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  roomNumber: string;

  @Column({ type: 'int', nullable: true })
  maxStudents: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Class, (classEntity) => classEntity.classYears)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @ManyToOne(() => AcademicYear, (academicYear) => academicYear.classYears)
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @OneToMany(
    () => StudentInscription,
    (inscription) => inscription.classYear,
  )
  studentInscriptions: StudentInscription[];

  @OneToMany(() => CourseClass, (courseClass) => courseClass.classYear)
  courseClasses: CourseClass[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
