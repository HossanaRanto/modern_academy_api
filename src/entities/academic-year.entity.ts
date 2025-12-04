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
import { Academy } from './academy.entity.js';
import { StudentInscription } from './student-inscription.entity.js';
import { ClassYear } from './class-year.entity.js';
import { Trimester } from './trimester.entity.js';

@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  academyId: string;

  @ManyToOne(() => Academy, (academy) => academy.academicYears)
  @JoinColumn({ name: 'academyId' })
  academy: Academy;

  @OneToMany(
    () => StudentInscription,
    (inscription) => inscription.academicYear,
  )
  studentInscriptions: StudentInscription[];

  @OneToMany(() => ClassYear, (classYear) => classYear.academicYear)
  classYears: ClassYear[];

  @OneToMany(() => Trimester, (trimester) => trimester.academicYear)
  trimesters: Trimester[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
