import { Module, Global } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';

@Global()
@Module({
  providers: [PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class PdfModule {}
