import { Injectable } from '@nestjs/common'
import { launch, executablePath } from 'puppeteer'
import { compile } from 'handlebars'
import { readFileSync } from 'fs'
import { join } from 'path'

@Injectable()
export class PdfService {
  async generatePdf(data: any, certificateOna: boolean) {
    if (certificateOna) {
      const templatePath = join(
        __dirname,
        'templates/pdf/certificates/NI_CMIT_D_01/certi9ficado-ona.hbs',
      )
      const templateContent = readFileSync(templatePath, 'utf-8')
    } else {
      const templatePath = join(
        __dirname,
        'templates/pdf/certificates/NI_CMIT_D_01/certi9ficado-ona.hbs',
      )
      const templateContent = readFileSync(templatePath, 'utf-8')
    }
  }
}
