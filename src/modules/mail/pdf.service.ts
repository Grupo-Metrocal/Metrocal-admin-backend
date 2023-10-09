import { Injectable } from '@nestjs/common'
import { launch, executablePath } from 'puppeteer'
import { compile } from 'handlebars'
import { readFileSync } from 'fs'
import { join } from 'path'

@Injectable()
export class PdfService {
  async generatePdf(template: string, data: any) {
    const templatePath = join(__dirname, 'templates/pdf', template)
    const templateContent = readFileSync(templatePath, 'utf-8')

    const compiledTemplate = compile(templateContent)

    const html = compiledTemplate(data)

    const browser = await launch({
      headless: 'new',
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXEC_PATH
          : executablePath(),
    })
    try {
      const page = await browser.newPage()
      await page.setContent(html)
      // const pdfBuffer = await page.pdf({ format: 'A4' })
      return await page.pdf({ format: 'A4' })
    } catch (e) {
      console.log(e)
    } finally {
      await browser.close()
    }
  }
}