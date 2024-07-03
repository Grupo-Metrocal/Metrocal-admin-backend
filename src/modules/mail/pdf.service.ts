import { Injectable } from '@nestjs/common'
import { launch, executablePath } from 'puppeteer'
import { compile } from 'handlebars'
import { readFileSync } from 'fs'
import { join } from 'path'
import axios from 'axios'
import * as https from 'https'

@Injectable()
export class PdfService {
  async generatePdf(template: string, data: any) {
    const templatePath = join(__dirname, 'templates/pdf', template)
    const templateContent = readFileSync(templatePath, 'utf-8')

    const metrocalLogo = await this.fetchImageAsBase64(
      'https://app-grupometrocal.com/development/api/images/image/metrocal.webp',
    )
    data.metrocalLogo = metrocalLogo

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
        footerTemplate:
          '<div style="text-align: right;width: 297mm;font-size: 8px;"><span style="margin-right: 1cm"><span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
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
      data.metrocalLogo = await this.fetchImageAsBase64(
        data.creditable
          ? 'https://app-grupometrocal.com/development/api/images/image/header-acreditado-2024-certificados_metrocal.png'
          : 'https://app-grupometrocal.com/development/api/images/image/header-no_acreditado-2024-certificados_metrocal.png',
      )

      // Agregar encabezado y pie de página
      const headerTemplate = compile(
        readFileSync(
          join(__dirname, 'templates/pdf/certificates/header.hbs'),
          'utf-8',
        ),
      )(data)

      const footerTemplate = compile(
        readFileSync(
          join(__dirname, 'templates/pdf/certificates/footer.hbs'),
          'utf-8',
        ),
      )(data)

      await page.setContent(finalHtml)
      await page.waitForTimeout(1000)

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        width: '8.5in',
        height: '11in',
        margin: {
          top: '2in',
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

  async generateQuoteRequestPdf(data: any) {
    const templatePath = join(
      __dirname,
      'templates/pdf/quoteRequestDownload/approved_quote_request.hbs',
    )
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
      data.metrocalLogo = await this.fetchImageAsBase64(
        'https://app-grupometrocal.com/development/api/images/image/metrocal.webp',
      )
      data.onaLogo = await this.fetchImageAsBase64(
        'https://app-grupometrocal.com/development/api/images/image/ona.webp',
      )

      // Agregar encabezado y pie de página
      const headerTemplate = compile(
        readFileSync(
          join(__dirname, 'templates/pdf/quoteRequestDownload/header.hbs'),
          'utf-8',
        ),
      )(data)

      const footerTemplate = compile(
        readFileSync(
          join(__dirname, 'templates/pdf/quoteRequestDownload/footer.hbs'),
          'utf-8',
        ),
      )(data)

      await page.setContent(html)
      await page.waitForTimeout(1000)

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        width: '8.5in',
        height: '11in',
        margin: {
          top: '1.1in',
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

  async fetchImageAsBase64(url: string) {
    try {
      // Realiza la solicitud para descargar la imagen
      const response = await axios.get(url, {
        responseType: 'arraybuffer', // Para obtener el contenido de la respuesta como un buffer
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      })

      // Convierte el buffer a base64
      const base64 = Buffer.from(response.data, 'binary').toString('base64')
      return `data:image/webp;base64,${base64}`
    } catch (error) {
      console.error('Error al descargar la imagen:', error)
      return null
    }
  }
}
