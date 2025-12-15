import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as StudentInscriptionPort from '../ports/student-inscription-repository.port';
import { UpdateInscriptionRequest, InscriptionResponse } from '../../domain/student.interface';

@Injectable()
export class UpdateInscriptionUseCase {
  constructor(
    @Inject(StudentInscriptionPort.STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: StudentInscriptionPort.IStudentInscriptionRepository,
  ) {}

  async execute(id: string, request: UpdateInscriptionRequest): Promise<InscriptionResponse> {
    const inscription = await this.inscriptionRepository.findById(id);
    
    if (!inscription) {
      throw new NotFoundException('Inscription not found');
    }
    
    // Update fields if provided
    if (request.status !== undefined) inscription.status = request.status;
    if (request.isPaid !== undefined) inscription.isPaid = request.isPaid;
    if (request.notes !== undefined) inscription.notes = request.notes;
    
    const updated = await this.inscriptionRepository.save(inscription);
    
    // Fetch full inscription with relations
    const fullInscription = await this.inscriptionRepository.findById(updated.id);
    
    return {
      id: fullInscription!.id,
      studentId: fullInscription!.studentId,
      academicYearId: fullInscription!.academicYearId,
      classYearId: fullInscription!.classYearId,
      inscriptionDate: fullInscription!.inscriptionDate,
      status: fullInscription!.status,
      isPaid: fullInscription!.isPaid,
      notes: fullInscription!.notes,
      createdAt: fullInscription!.createdAt,
      updatedAt: fullInscription!.updatedAt,
      className: fullInscription!.classYear?.class?.name,
      academicYearName: fullInscription!.academicYear?.name,
      student: fullInscription!.student ? {
        id: fullInscription!.student.id,
        firstName: fullInscription!.student.firstName,
        lastName: fullInscription!.student.lastName,
        registrationNumber: fullInscription!.student.registrationNumber,
        dateOfBirth: fullInscription!.student.dateOfBirth,
        placeOfBirth: fullInscription!.student.placeOfBirth,
        gender: fullInscription!.student.gender,
        photo: fullInscription!.student.photo,
        address: fullInscription!.student.address,
        phone: fullInscription!.student.phone,
        email: fullInscription!.student.email,
        parentName: fullInscription!.student.parentName,
        parentPhone: fullInscription!.student.parentPhone,
        parentEmail: fullInscription!.student.parentEmail,
        isActive: fullInscription!.student.isActive,
        createdAt: fullInscription!.student.createdAt,
        updatedAt: fullInscription!.student.updatedAt,
      } : undefined,
    };
  }
}
