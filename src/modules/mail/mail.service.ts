import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private async sendMail(
    user: string,
    subject: string,
    template: string,
    context: { [key: string]: any },
  ) {
    await this.mailerService.sendMail({
      to: user,
      from: process.env.MAILER_FROM,
      subject: subject,
      template: template,
      context: context,
    })
  }

  async sendMailWelcomeApp(user: string) {
    await this.sendMail(
      user,
      'Bienvenido a bordo 🚀 Metrocal te da la Bienvenida!',
      'welcome',
      {
        user,
      },
    )
  }

  async sendMailResetPassword(user: string, code: string) {
    await this.sendMail(user, 'Recuperar contraseña', 'restore_password', {
      user,
      code,
    })
  }
}
