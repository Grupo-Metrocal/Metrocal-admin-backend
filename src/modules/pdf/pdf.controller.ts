import { Controller, Get, Res } from '@nestjs/common'
import { Response } from 'express'
import { PdfService } from './pdf.service'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('pdf')
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('generate')
  async generatePdf(@Res() res: Response) {
    const data = {
      name: 'John Doe',
      age: 26,
      city: 'New York',
    }
    const pdfBuffer = await this.pdfService.generatePdf('template.hbs', data)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=mi_archivo.pdf')
    res.send(pdfBuffer)
  }
}
