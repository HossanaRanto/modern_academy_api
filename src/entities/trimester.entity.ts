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
import { AcademicYear } from './academic-year.entity.js';
import { Test } from './test.entity.js';

@Entity('trimesters')
export class Trimester {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @Column({ type: 'uuid' })
  academicYearId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => AcademicYear, (academicYear) => academicYear.trimesters)
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @OneToMany(() => Test, (test) => test.trimester)
  tests: Test[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
