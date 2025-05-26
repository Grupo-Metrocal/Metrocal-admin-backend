import { Injectable } from '@nestjs/common'
import { launch, executablePath } from 'puppeteer'
import { compile } from 'handlebars'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { Recipe } from 'muhammara'
import { join } from 'path'
import axios from 'axios'
import * as https from 'https'
import { PDFDocument } from 'pdf-lib'

@Injectable()
export class PdfService {
  async generatePdf(template: string, data: any, orientation = 'portrait') {
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
        landscape: orientation === 'landscape',
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

  async generteServiceOrderPdf(data: any) {
    const templatePath = join(__dirname, 'templates/pdf/service_order.hbs')
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

      await page.setContent(html)
      await page.waitForTimeout(1000)

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        landscape: true,
        height: '8.5in',
        width: '11in',
        margin: {
          top: '0.2in',
          bottom: '0.2in',
          left: '0.2in',
          right: '0.2in',
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

      return await this.protectPdf(pdfBuffer)
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

      const quotePdfBuffer = await page.pdf({
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

      const conditionsAndServicePdfBuffer =
        await this.generateConditionsAndServicePDF()

      const mergedBuffer = await this.mergePdfBuffers(
        quotePdfBuffer,
        conditionsAndServicePdfBuffer as any,
      )

      return mergedBuffer
    } catch (error) {
      console.error(error.message)
      return false
    } finally {
      await browser.close()
    }
  }

  async mergePdfBuffers(pdfBuffer1: Buffer, pdfBuffer2: Buffer) {
    // Crear un nuevo documento PDF
    const mergedPdf = await PDFDocument.create()

    // Cargar los documentos PDF desde los buffers
    const pdf1 = await PDFDocument.load(pdfBuffer1)
    const pdf2 = await PDFDocument.load(pdfBuffer2)

    // Copiar las páginas del primer PDF al nuevo documento
    const copiedPages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices())
    copiedPages1.forEach((page) => mergedPdf.addPage(page))

    // Copiar las páginas del segundo PDF al nuevo documento
    const copiedPages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices())
    copiedPages2.forEach((page) => mergedPdf.addPage(page))

    // Guardar el nuevo documento combinado como un buffer
    const mergedPdfBytes = await mergedPdf.save()

    // return buffer of the merged pdf
    return Buffer.from(mergedPdfBytes)
  }

  async generateConditionsAndServicePDF() {
    const templatePath = join(
      __dirname,
      'templates/pdf/conditions_and_service.hbs',
    )

    const templateContent = readFileSync(templatePath, 'utf-8')

    const compiledTemplate = compile(templateContent)

    const html = compiledTemplate({})

    const browser = await launch({
      headless: 'new',
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXEC_PATH
          : executablePath(),
    })

    try {
      const page = await browser.newPage()
      const metrocalLogo = await this.fetchImageAsBase64(
        'https://app-grupometrocal.com/development/api/images/image/metrocal.webp',
      )

      const headerTemplate = compile(
        readFileSync(
          join(__dirname, 'templates/pdf/quoteRequestDownload/header.hbs'),
          'utf-8',
        ),
      )({ metrocalLogo })

      const footerTemplate = compile(
        readFileSync(
          join(__dirname, 'templates/pdf/quoteRequestDownload/footer.hbs'),
          'utf-8',
        ),
      )({ metrocalLogo })

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

  async protectPdf(pdfBuffer: Buffer) {
    const inputPath = join(__dirname, 'temp_input.pdf')
    const outputPath = join(__dirname, 'temp_output.pdf')

    writeFileSync(inputPath, pdfBuffer)

    const pdfDoc = new Recipe(inputPath, outputPath)

    pdfDoc
      .encrypt({
        ownerPassword: '123',
        userProtectionFlag: 4,
      })
      .endPDF()

    await this.sleep(500)

    const protectedBuffer = readFileSync(outputPath)

    try {
      unlinkSync(inputPath)
      unlinkSync(outputPath)
    } catch (err) {
      console.warn(
        'No se pudieron borrar los archivos temporales:',
        err.message,
      )
    }

    return protectedBuffer
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
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
