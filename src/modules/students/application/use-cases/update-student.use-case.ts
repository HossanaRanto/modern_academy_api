import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import * as StudentPort from '../ports/student-repository.port';
import { UpdateStudentRequest, StudentResponse } from '../../domain/student.interface';

@Injectable()
export class UpdateStudentUseCase {
  constructor(
    @Inject(StudentPort.STUDENT_REPOSITORY)
    private readonly studentRepository: StudentPort.IStudentRepository,
  ) {}

  async execute(id: string, request: UpdateStudentRequest): Promise<StudentResponse> {
    const student = await this.studentRepository.findById(id);
    
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    
    // Update fields if provided
    if (request.firstName !== undefined) student.firstName = request.firstName;
    if (request.lastName !== undefined) student.lastName = request.lastName;
    if (request.dateOfBirth !== undefined) student.dateOfBirth = request.dateOfBirth;
    if (request.placeOfBirth !== undefined) student.placeOfBirth = request.placeOfBirth;
    if (request.gender !== undefined) student.gender = request.gender;
    if (request.photo !== undefined) student.photo = request.photo;
    if (request.address !== undefined) student.address = request.address;
    if (request.phone !== undefined) student.phone = request.phone;
    if (request.email !== undefined) student.email = request.email;
    if (request.parentName !== undefined) student.parentName = request.parentName;
    if (request.parentPhone !== undefined) student.parentPhone = request.parentPhone;
    if (request.parentEmail !== undefined) student.parentEmail = request.parentEmail;
    if (request.isActive !== undefined) student.isActive = request.isActive;
    
    const updated = await this.studentRepository.save(student);
    
    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      registrationNumber: updated.registrationNumber,
      dateOfBirth: updated.dateOfBirth,
      placeOfBirth: updated.placeOfBirth,
      gender: updated.gender,
      photo: updated.photo,
      address: updated.address,
      phone: updated.phone,
      email: updated.email,
      parentName: updated.parentName,
      parentPhone: updated.parentPhone,
      parentEmail: updated.parentEmail,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
