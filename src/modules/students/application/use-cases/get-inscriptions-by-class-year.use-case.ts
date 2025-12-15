import { Injectable, Inject } from '@nestjs/common';
import * as StudentInscriptionPort from '../ports/student-inscription-repository.port';
import { InscriptionResponse } from '../../domain/student.interface';

@Injectable()
export class GetInscriptionsByClassYearUseCase {
  constructor(
    @Inject(StudentInscriptionPort.STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: StudentInscriptionPort.IStudentInscriptionRepository,
  ) {}

  async execute(classYearId: string): Promise<InscriptionResponse[]> {
    const inscriptions = await this.inscriptionRepository.findByClassYear(classYearId);
    
    return inscriptions.map(inscription => ({
      id: inscription.id,
      studentId: inscription.studentId,
      academicYearId: inscription.academicYearId,
      classYearId: inscription.classYearId,
      inscriptionDate: inscription.inscriptionDate,
      status: inscription.status,
      isPaid: inscription.isPaid,
      notes: inscription.notes,
      createdAt: inscription.createdAt,
      updatedAt: inscription.updatedAt,
      student: inscription.student ? {
        id: inscription.student.id,
        firstName: inscription.student.firstName,
        lastName: inscription.student.lastName,
        registrationNumber: inscription.student.registrationNumber,
        dateOfBirth: inscription.student.dateOfBirth,
        placeOfBirth: inscription.student.placeOfBirth,
        gender: inscription.student.gender,
        photo: inscription.student.photo,
        address: inscription.student.address,
        phone: inscription.student.phone,
        email: inscription.student.email,
        parentName: inscription.student.parentName,
        parentPhone: inscription.student.parentPhone,
        parentEmail: inscription.student.parentEmail,
        isActive: inscription.student.isActive,
        createdAt: inscription.student.createdAt,
        updatedAt: inscription.student.updatedAt,
      } : undefined,
    }));
  }
}
