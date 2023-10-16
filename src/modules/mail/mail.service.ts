import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { ApprovedQuoteRequestDto } from './dto/approved-quote-request.dto'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private async sendMail({
    user,
    subject,
    template,
    context,
  }: {
    user: string
    subject: string
    template: string
    context: { [key: string]: any }
  }) {
    await this.mailerService.sendMail({
      to: user,
      from: process.env.MAILER_FROM,
      subject: subject,
      template: template,
      context: context,
    })
  }

  async sendMailWelcomeApp({ user, name }) {
    await this.sendMail({
      user,
      subject: 'Bienvenido a bordo 🚀 Metrocal te da la Bienvenida!',
      template: 'welcome',
      context: {
        name,
      },
    })
  }

  async sendMailResetPassword(user: string, code: string) {
    await this.sendMail({
      user,
      subject: 'Recuperar contraseña',
      template: 'restore_password',
      context: {
        user,
        code,
      },
    })
  }

  async sendMailApprovedQuoteRequest(
    approvedQuoteRequestDto: ApprovedQuoteRequestDto,
  ) {
    await this.sendMail({
      user: approvedQuoteRequestDto.email,
      subject: 'Cotización aprobada',
      template: 'approved_quote_request',
      context: {
        ...approvedQuoteRequestDto,
      },
    })
  }
}
