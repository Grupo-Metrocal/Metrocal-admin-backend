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
      await page.waitForTimeout(1000)
      // const pdfBuffer = await page.pdf({ format: 'A4' })
      return await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate: `true`,
      })
    } catch (e) {
      return false
    } finally {
      await browser.close()
    }
  }

  async generateCertificatePdf(template: string, data: any) {
    const templatePath = join(__dirname, 'templates/pdf', template)
    const templateContent = readFileSync(templatePath, 'utf-8')

    const compiledTemplate = compile(templateContent)

    const html = compiledTemplate(data)

    const copileLayout = compile(
      readFileSync(
        join(__dirname, 'templates/pdf/certificates/layout.hbs'),
        'utf-8',
      ),
    )

    const finalHtml = copileLayout({ content: html })

    const browser = await launch({
      headless: 'new',
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXEC_PATH
          : executablePath(),
    })
    try {
      const page = await browser.newPage()

      // Agregar encabezado y pie de página
      const headerTemplate = compile(
        readFileSync(
          join(__dirname, 'templates/pdf/certificates/header.hbs'),
          'utf-8',
        ),
      )(data.creditable)

      const footerTemplate = compile(
        readFileSync(
          join(__dirname, 'templates/pdf/certificates/footer.hbs'),
          'utf-8',
        ),
      )(data.creditable)

      await page.setContent(finalHtml)

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        width: '8.5in',
        height: '11in',
        margin: {
          top: '1in',
          bottom: '1in',
          left: '0.4in',
          right: '0.4in',
        },
      })

      return pdfBuffer
    } catch (error) {
      console.error(error.message)
      return false
    } finally {
      await browser.close()
    }
  }
}
