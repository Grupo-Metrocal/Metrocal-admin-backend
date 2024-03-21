import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { ApprovedQuoteRequestDto } from './dto/approved-quote-request.dto'
import { InvitationMail } from './dto/invitation-mail.dto'
import { RejectedQuoteRequest } from './dto/rejected-quote-request.dto'
import { ServiceOrderDto } from './dto/service-order.dto'

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

  async sendMailWelcomeApp({ user, name, loginURL }) {
    await this.sendMail({
      user,
      subject: 'Bienvenido a bordo 🚀 Metrocal te da la Bienvenida!',
      template: 'welcome',
      context: {
        name,
        loginURL,
        user,
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

  async sendMailrejectedQuoteRequest(rejected: RejectedQuoteRequest) {
    await this.mailerService.sendMail({
      to: rejected.email,
      from: process.env.MAILER_FROM,
      subject: 'Cotizacion rechazada',
      template: 'rejected_quote_request',
      context: {
        ...rejected,
      },
    })
  }

  async sendInvitationMail(inv: InvitationMail) {
    await this.mailerService.sendMail({
      to: inv.email,
      from: process.env.MAILER_FROM,
      subject: 'Cotización de servicios',
      template: 'invitation_for_user',
      context: {
        ...inv,
      },
    })
  }

  async sendServiceOrderMail({
    to,
    pdf,
    clientName,
    quoteNumber,
    startDate,
    endDate,
    technicians,
  }: ServiceOrderDto) {
    await this.mailerService.sendMail({
      to,
      from: process.env.MAILER_FROM,
      subject: 'Orden de servicio',
      template: 'service_order',
      context: {
        clientName,
        quoteNumber,
        startDate,
        endDate,
        technicians,
      },
      attachments: [
        {
          filename: 'Orden de servicio.pdf',
          content: pdf,
        },
      ],
    })
  }
}
