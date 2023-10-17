import { Controller, Get, Res } from '@nestjs/common'
import { AppService } from './app.service'
import { PdfService } from './modules/mail/pdf.service'
import { Response } from 'express'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { UseGuards } from '@nestjs/common'

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('app/verify')
  @UseGuards(JwtAuthGuard)
  verify() {
    return { status: 200 }
  }

  @Get('pdf')
  async getPdf(@Res() res: Response) {
    const pdf = await this.pdfService.generatePdf('template.hbs', {
      name: 'John Doe',
    })

    // auto download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=welcome.pdf')
    res.send(pdf)
  }
}
