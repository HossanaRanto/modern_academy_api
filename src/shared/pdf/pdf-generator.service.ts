import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface PdfGenerationOptions {
  templateName: string;
  data: Record<string, any>;
  filename?: string;
  format?: 'A4' | 'Letter';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private readonly templatesPath = path.join(process.cwd(), 'src', 'shared', 'pdf', 'templates');
  private browser: puppeteer.Browser | null = null;

  /**
   * Initialize browser instance (reusable)
   */
  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser || !this.browser.connected) {
      this.logger.log('Launching browser...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Generate PDF from HTML template
   */
  async generatePdf(options: PdfGenerationOptions): Promise<Buffer> {
    const {
      templateName,
      data,
      format = 'A4',
      landscape = false,
      margin = { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    } = options;

    try {
      // Load and compile template
      const html = await this.compileTemplate(templateName, data);

      // Generate PDF
      const browser = await this.getBrowser();
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const pdfBuffer = await page.pdf({
        format,
        landscape,
        margin,
        printBackground: true,
        preferCSSPageSize: false,
      });

      await page.close();

      this.logger.log(`PDF generated successfully: ${templateName}`);
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error generating PDF: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Compile Handlebars template with data
   */
  private async compileTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    try {
      // Load main template
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Load styles
      const stylesPath = path.join(this.templatesPath, 'styles', `${templateName}.css`);
      let styles = '';
      try {
        styles = await fs.readFile(stylesPath, 'utf-8');
      } catch (error) {
        // Styles are optional
        this.logger.warn(`No styles found for template: ${templateName}`);
      }

      // Load base styles
      const baseStylesPath = path.join(this.templatesPath, 'styles', 'base.css');
      let baseStyles = '';
      try {
        baseStyles = await fs.readFile(baseStylesPath, 'utf-8');
      } catch (error) {
        this.logger.warn('No base styles found');
      }

      // Register Handlebars helpers
      this.registerHelpers();

      // Compile template
      const template = Handlebars.compile(templateContent);
      const html = template(data);

      // Wrap with HTML structure
      return this.wrapHtml(html, baseStyles, styles);
    } catch (error) {
      this.logger.error(`Error compiling template: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    // Format date helper
    Handlebars.registerHelper('formatDate', (date: Date | string, format?: string) => {
      if (!date) return '';
      const d = new Date(date);
      
      if (format === 'short') {
        return d.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    // Format currency helper
    Handlebars.registerHelper('formatCurrency', (amount: number, currency = 'USD') => {
      if (amount === null || amount === undefined) return '';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    });

    // Uppercase helper
    Handlebars.registerHelper('uppercase', (text: string) => {
      return text ? text.toUpperCase() : '';
    });

    // Conditional equality helper
    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });

    // Current year helper
    Handlebars.registerHelper('currentYear', () => {
      return new Date().getFullYear();
    });
  }

  /**
   * Wrap HTML content with structure
   */
  private wrapHtml(content: string, baseStyles: string, customStyles: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${baseStyles}
          ${customStyles}
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }

  /**
   * Cleanup browser instance
   */
  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Browser closed');
    }
  }
}
