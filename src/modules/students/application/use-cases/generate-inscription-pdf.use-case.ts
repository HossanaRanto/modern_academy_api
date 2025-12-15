import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PdfGeneratorService } from '../../../../shared/pdf/pdf-generator.service';
import { STUDENT_INSCRIPTION_REPOSITORY } from '../ports/student-inscription-repository.port';
import type { IStudentInscriptionRepository } from '../ports/student-inscription-repository.port';

export interface GenerateInscriptionPdfRequest {
  inscriptionId: string;
  academyName: string;
  academyAddress?: string;
  academyPhone?: string;
  academyEmail?: string;
  academyLogo?: string;
}

@Injectable()
export class GenerateInscriptionPdfUseCase {
  constructor(
    @Inject(STUDENT_INSCRIPTION_REPOSITORY)
    private readonly inscriptionRepository: IStudentInscriptionRepository,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  async execute(request: GenerateInscriptionPdfRequest): Promise<Buffer> {
    // Fetch inscription with all relations
    const inscription = await this.inscriptionRepository.findById(request.inscriptionId);

    if (!inscription) {
      throw new NotFoundException('Inscription not found');
    }

    // Prepare data for PDF template
    const pdfData = {
      // Academy information
      academyName: request.academyName,
      academyAddress: request.academyAddress,
      academyPhone: request.academyPhone,
      academyEmail: request.academyEmail,
      academyLogo: request.academyLogo,

      // Inscription information
      inscriptionDate: inscription.inscriptionDate,
      status: inscription.status,
      isPaid: inscription.isPaid,
      notes: inscription.notes,

      // Academic information
      academicYearName: inscription.academicYear?.name || 'N/A',
      className: inscription.classYear?.class?.name || 'N/A',

      // Student information
      student: {
        firstName: inscription.student?.firstName || '',
        lastName: inscription.student?.lastName || '',
        registrationNumber: inscription.student?.registrationNumber || '',
        dateOfBirth: inscription.student?.dateOfBirth || null,
        placeOfBirth: inscription.student?.placeOfBirth || '',
        gender: inscription.student?.gender || '',
        address: inscription.student?.address || '',
        phone: inscription.student?.phone || '',
        email: inscription.student?.email || '',
        parentName: inscription.student?.parentName || '',
        parentPhone: inscription.student?.parentPhone || '',
        parentEmail: inscription.student?.parentEmail || '',
      },

      // Metadata
      generatedDate: new Date(),
    };

    // Generate PDF
    const pdfBuffer = await this.pdfGenerator.generatePdf({
      templateName: 'inscription-form',
      data: pdfData,
      format: 'A4',
      landscape: false,
    });

    return pdfBuffer;
  }
}
