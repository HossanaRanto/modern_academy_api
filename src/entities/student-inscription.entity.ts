import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity.js';
import { AcademicYear } from './academic-year.entity.js';
import { ClassYear } from './class-year.entity.js';

export enum InscriptionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('student_inscriptions')
export class StudentInscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  academicYearId: string;

  @Column({ type: 'uuid' })
  classYearId: string;

  @Column({ type: 'date' })
  inscriptionDate: Date;

  @Column({
    type: 'enum',
    enum: InscriptionStatus,
    default: InscriptionStatus.PENDING,
  })
  status: InscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tuitionFee: number;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Student, (student) => student.inscriptions)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => AcademicYear, (academicYear) => academicYear.studentInscriptions)
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @ManyToOne(() => ClassYear, (classYear) => classYear.studentInscriptions)
  @JoinColumn({ name: 'classYearId' })
  classYear: ClassYear;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
