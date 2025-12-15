import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentInscription, InscriptionStatus } from '../../../../entities/student-inscription.entity';
import { CourseClass } from '../../../../entities/course-class.entity';
import { IStudentInscriptionRepository } from '../../application/ports/student-inscription-repository.port';

@Injectable()
export class StudentInscriptionRepositoryAdapter
  implements IStudentInscriptionRepository
{
  constructor(
    @InjectRepository(StudentInscription)
    private readonly inscriptionRepository: Repository<StudentInscription>,
    @InjectRepository(CourseClass)
    private readonly courseClassRepository: Repository<CourseClass>,
  ) {}

  async findByStudentAndAcademicYear(
    studentId: string,
    academicYearId: string,
  ): Promise<StudentInscription | null> {
    return this.inscriptionRepository.findOne({
      where: { studentId, academicYearId, status: InscriptionStatus.CONFIRMED },
      relations: ['classYear', 'classYear.class'],
    });
  }

  async findStudentClassYear(
    studentId: string,
    academicYearId: string,
  ): Promise<string | null> {
    const inscription = await this.inscriptionRepository.findOne({
      where: { studentId, academicYearId, status: InscriptionStatus.CONFIRMED },
      select: ['classYearId'],
    });

    return inscription?.classYearId || null;
  }

  async isStudentEnrolledInCourse(
    studentId: string,
    courseId: string,
    academicYearId: string,
  ): Promise<boolean> {
    // Get student's class year for the academic year
    const inscription = await this.inscriptionRepository.findOne({
      where: { studentId, academicYearId, status: InscriptionStatus.CONFIRMED },
      select: ['classYearId'],
    });

    if (!inscription) {
      return false;
    }

    // Check if the course is taught in the student's class year
    const courseClass = await this.courseClassRepository.findOne({
      where: {
        courseId,
        classYearId: inscription.classYearId,
        isActive: true,
      },
    });

    return !!courseClass;
  }
}
