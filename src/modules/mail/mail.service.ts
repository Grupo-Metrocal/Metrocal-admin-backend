import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMailWelcomeApp(user: string) {
    await this.mailerService.sendMail({
      to: user,
      from: process.env.MAILER_FROM,
      subject: 'Welcome to Metrocal 🚀',
      template: 'welcome',
      context: {
        name: user,
      },
    })
  }
}
