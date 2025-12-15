# PDF Generation Architecture

## Overview

This is a reusable, template-based PDF generation system built with NestJS, Puppeteer, and Handlebars. It allows you to create professional PDF documents from HTML/CSS templates.

## Architecture

```
src/shared/pdf/
├── pdf.module.ts                 # Global PDF module
├── pdf-generator.service.ts      # Core PDF generation service
└── templates/
    ├── inscription-form.hbs      # Template files (.hbs)
    ├── [other-template].hbs
    └── styles/
        ├── base.css              # Base styles for all PDFs
        ├── inscription-form.css  # Template-specific styles
        └── [other-template].css
```

## Features

- ✅ **Reusable Service**: Global module available across all modules
- ✅ **HTML/CSS Based**: Full control over design with familiar web technologies
- ✅ **Template Engine**: Handlebars for dynamic content
- ✅ **Built-in Helpers**: Date formatting, currency, conditionals, etc.
- ✅ **Performance**: Browser instance reused across requests
- ✅ **Modular Styles**: Base + template-specific CSS
- ✅ **Type-Safe**: Full TypeScript support

## Dependencies

Install the required packages:

```bash
npm install puppeteer handlebars
npm install -D @types/puppeteer
```

Update `package.json` if using Docker:

```json
{
  "dependencies": {
    "puppeteer": "^22.0.0",
    "handlebars": "^4.7.8"
  }
}
```

## Usage

### 1. Create a Template

Create a Handlebars template in `src/shared/pdf/templates/`:

**Example: `my-document.hbs`**
```handlebars
<div class="container">
  <div class="header">
    <h1>{{title}}</h1>
  </div>
  
  <div class="section">
    <h2>{{sectionTitle}}</h2>
    <p>{{content}}</p>
  </div>
  
  <div class="footer">
    <p>Generated on {{formatDate generatedDate}}</p>
  </div>
</div>
```

### 2. Create Styles

Create corresponding CSS in `src/shared/pdf/templates/styles/`:

**Example: `my-document.css`**
```css
.header {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
}

.section {
  margin: 20px 0;
  padding: 15px;
  border-left: 4px solid #667eea;
}
```

### 3. Create a Use Case

**Example: `generate-my-pdf.use-case.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { PdfGeneratorService } from '../../../shared/pdf/pdf-generator.service';

@Injectable()
export class GenerateMyPdfUseCase {
  constructor(private readonly pdfGenerator: PdfGeneratorService) {}

  async execute(data: any): Promise<Buffer> {
    const pdfBuffer = await this.pdfGenerator.generatePdf({
      templateName: 'my-document',
      data: {
        title: 'My Document',
        sectionTitle: 'Introduction',
        content: 'This is the content...',
        generatedDate: new Date(),
      },
      format: 'A4',
      landscape: false,
    });

    return pdfBuffer;
  }
}
```

### 4. Add Controller Endpoint

```typescript
import { Controller, Get, Res, Param } from '@nestjs/common';
import type { Response } from 'express';

@Controller('documents')
export class DocumentController {
  constructor(
    private readonly generateMyPdfUseCase: GenerateMyPdfUseCase,
  ) {}

  @Get(':id/pdf')
  async generatePdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.generateMyPdfUseCase.execute({ id });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=document-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
```

### 5. Register in Module

```typescript
import { PdfModule } from '../../shared/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  providers: [GenerateMyPdfUseCase],
  controllers: [DocumentController],
})
export class DocumentModule {}
```

## Available Handlebars Helpers

### `formatDate`
Format dates in various formats:
```handlebars
{{formatDate myDate}}           <!-- January 15, 2025 -->
{{formatDate myDate 'short'}}   <!-- Jan 15, 2025 -->
```

### `formatCurrency`
Format currency amounts:
```handlebars
{{formatCurrency amount}}              <!-- $1,234.56 -->
{{formatCurrency amount 'EUR'}}        <!-- €1,234.56 -->
```

### `uppercase`
Convert text to uppercase:
```handlebars
{{uppercase text}}
```

### `eq`
Conditional equality check:
```handlebars
{{#if (eq status 'active')}}
  Active badge
{{/if}}
```

### `currentYear`
Get current year:
```handlebars
© {{currentYear}} Company Name
```

## PDF Generation Options

```typescript
interface PdfGenerationOptions {
  templateName: string;          // Template file name (without .hbs)
  data: Record<string, any>;     // Data to pass to template
  filename?: string;              // Optional filename
  format?: 'A4' | 'Letter';      // Paper format (default: A4)
  landscape?: boolean;            // Orientation (default: false)
  margin?: {                      // Page margins
    top?: string;                 // Default: '20mm'
    right?: string;               // Default: '15mm'
    bottom?: string;              // Default: '20mm'
    left?: string;                // Default: '15mm'
  };
}
```

## Docker Configuration

If running in Docker, add these args to Dockerfile:

```dockerfile
# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

## Example: Inscription Form

The inscription form is already implemented as a reference:

**Endpoint**: `GET /students/inscriptions/:id/pdf`

**Template**: `inscription-form.hbs`

**Styles**: `inscription-form.css`

**Use Case**: `GenerateInscriptionPdfUseCase`

## Best Practices

1. **Separate Concerns**: Keep templates, styles, and logic separate
2. **Reuse Base Styles**: Use `base.css` for common elements
3. **Performance**: Browser instance is reused automatically
4. **Error Handling**: Service logs errors with context
5. **Type Safety**: Define interfaces for template data
6. **Testing**: Test with sample data before production

## Extending the System

### Add Custom Helpers

Edit `pdf-generator.service.ts`:

```typescript
private registerHelpers(): void {
  // Your existing helpers...
  
  // Add new helper
  Handlebars.registerHelper('myHelper', (value: any) => {
    return value.toUpperCase();
  });
}
```

### Add Partials

For reusable template components:

```typescript
// In pdf-generator.service.ts
Handlebars.registerPartial('header', headerTemplate);
```

Then use in templates:
```handlebars
{{> header}}
```

## Troubleshooting

### Browser Launch Fails
- Ensure Chromium dependencies are installed
- Check Docker args if containerized
- Verify `--no-sandbox` flag is set

### Template Not Found
- Check file path: `src/shared/pdf/templates/[name].hbs`
- Verify file extension is `.hbs`
- Check file permissions

### Styles Not Applied
- Ensure CSS file exists in `templates/styles/`
- Check file naming matches template name
- Verify CSS syntax is valid

### Memory Issues
- Browser automatically closes pages after generation
- Browser instance reuses connections
- Consider limiting concurrent PDF generations

## Future Enhancements

- [ ] Add support for headers/footers with page numbers
- [ ] Support for multiple languages/locales
- [ ] Image embedding from URLs
- [ ] Batch PDF generation
- [ ] PDF compression options
- [ ] Watermark support
- [ ] Digital signatures
