import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as StudentPort from '../ports/student-repository.port';
import * as StudentInscriptionPort from '../ports/student-inscription-repository.port';
import * as ClassYearPort from '../../../classes/application/ports/class-year-repository.port';
import * as ClassPort from '../../../classes/application/ports/class-repository.port';
import { 
  RegisterStudentRequest, 
  RegisterStudentResponse 
} from '../../domain/student.interface';
import { InscriptionStatus } from '../../../../entities/student-inscription.entity';

@Injectable()
export class RegisterStudentUseCase {
  constructor(
    @Inject(StudentPort.STUDENT_REPOSITORY)
    private readonly studentRepository: StudentPort.IStudentRepository,
    @Inject(StudentInscriptionPort.STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: StudentInscriptionPort.IStudentInscriptionRepository,
    @Inject(ClassYearPort.CLASS_YEAR_REPOSITORY)
    private readonly classYearRepository: ClassYearPort.IClassYearRepository,
    @Inject(ClassPort.CLASS_REPOSITORY)
    private readonly classRepository: ClassPort.IClassRepository,
  ) {}

  async execute(
    request: RegisterStudentRequest,
    academicYearId: string,
  ): Promise<RegisterStudentResponse> {
    // Validate that either classYearId or classCode is provided
    if (!request.classYearId && !request.classCode) {
      throw new BadRequestException(
        'Either classYearId or classCode must be provided',
      );
    }

    let classYear;

    // Priority 1: Use classYearId if provided
    if (request.classYearId) {
      classYear = await this.classYearRepository.findById(request.classYearId);
      if (!classYear) {
        throw new NotFoundException('Class year not found');
      }
    } 
    // Priority 2: Use classCode to find the class and then its class year
    else if (request.classCode) {
      const classEntity = await this.classRepository.findByCode(request.classCode);
      if (!classEntity) {
        throw new NotFoundException(`Class with code "${request.classCode}" not found`);
      }

      // Find the class year for this class and academic year
      classYear = await this.classYearRepository.findByClassAndAcademicYear(
        classEntity.id,
        academicYearId,
      );

      if (!classYear) {
        throw new NotFoundException(
          `Class year not found for class "${request.classCode}" in the current academic year`,
        );
      }
    }

    // Verify class year belongs to the academic year
    if (classYear.academicYearId !== academicYearId) {
      throw new ConflictException('Class year does not belong to the current academic year');
    }

    // Check if student already exists by registration number
    let student = await this.studentRepository.findByRegistrationNumber(
      request.registrationNumber,
    );
    
    let isNewStudent = false;

    if (student) {
      // Check if student is already registered for this academic year
      const existingInscription = await this.inscriptionRepository.findByStudentAndAcademicYear(
        student.id,
        academicYearId,
      );

      if (existingInscription) {
        throw new ConflictException(
          'Student is already registered for this academic year',
        );
      }

      // Update student information if provided
      const updatedFields: Partial<typeof student> = {};
      if (request.firstName) updatedFields.firstName = request.firstName;
      if (request.lastName) updatedFields.lastName = request.lastName;
      if (request.dateOfBirth) updatedFields.dateOfBirth = request.dateOfBirth;
      if (request.placeOfBirth) updatedFields.placeOfBirth = request.placeOfBirth;
      if (request.gender) updatedFields.gender = request.gender;
      if (request.photo !== undefined) updatedFields.photo = request.photo;
      if (request.address !== undefined) updatedFields.address = request.address;
      if (request.phone !== undefined) updatedFields.phone = request.phone;
      if (request.email !== undefined) updatedFields.email = request.email;
      if (request.parentName !== undefined) updatedFields.parentName = request.parentName;
      if (request.parentPhone !== undefined) updatedFields.parentPhone = request.parentPhone;
      if (request.parentEmail !== undefined) updatedFields.parentEmail = request.parentEmail;

      if (Object.keys(updatedFields).length > 0) {
        Object.assign(student, updatedFields);
        student = await this.studentRepository.save(student);
      }
    } else {
      // Create new student
      isNewStudent = true;
      student = await this.studentRepository.create({
        firstName: request.firstName,
        lastName: request.lastName,
        registrationNumber: request.registrationNumber,
        dateOfBirth: request.dateOfBirth,
        placeOfBirth: request.placeOfBirth,
        gender: request.gender,
        photo: request.photo,
        address: request.address,
        phone: request.phone,
        email: request.email,
        parentName: request.parentName,
        parentPhone: request.parentPhone,
        parentEmail: request.parentEmail,
        isActive: true,
      });
    }

    // Create inscription
    const inscription = await this.inscriptionRepository.create({
      studentId: student.id,
      academicYearId: academicYearId,
      classYearId: classYear.id, // Use the resolved classYear.id
      inscriptionDate: request.inscriptionDate,
      status: InscriptionStatus.CONFIRMED,
      isPaid: false,
      notes: request.notes,
    });

    // Fetch full inscription with relations
    const fullInscription = await this.inscriptionRepository.findById(inscription.id);

    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        registrationNumber: student.registrationNumber,
        dateOfBirth: student.dateOfBirth,
        placeOfBirth: student.placeOfBirth,
        gender: student.gender,
        photo: student.photo,
        address: student.address,
        phone: student.phone,
        email: student.email,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
        isActive: student.isActive,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
      inscription: {
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
      },
      isNewStudent,
    };
  }
}
