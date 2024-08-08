import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigModule } from '@nestjs/config'
import { join } from 'path'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { PdfService } from './pdf.service'
import { google } from 'googleapis'
import { HelperDeclareSpec } from 'handlebars'

const helpers: HelperDeclareSpec = {
  ifArrayEq: (array: any, compare: any, options: any) => {
    if (array.length === compare) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
  eq: (a: any, b: any, options: any) => {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  ltArray: (array: any, b: any, options: any) => {
    return array.length < b ? options.fn(this) : options.inverse(this)
  },
  gtArray: (array: any, b: any, options: any) => {
    return array.length > b ? options.fn(this) : options.inverse(this)
  },
  isEven: (n: any, options: any) => {
    return n % 2 === 0 ? options.fn(this) : options.inverse(this)
  },
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      useFactory: async () => {
        const oauth2Client = new google.auth.OAuth2(
          process.env.CLIENT_ID,
          process.env.CLIENT_SECRET,
          process.env.REDIRECT_URI,
        )
        oauth2Client.setCredentials({
          refresh_token: process.env.REFRESH_TOKEN,
        })

        const accessToken = await oauth2Client.getAccessToken()

        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              type: 'OAuth2',
              user: process.env.MAILER_USER,
              clientId: process.env.CLIENT_ID,
              clientSecret: process.env.CLIENT_SECRET,
              refreshToken: process.env.REFRESH_TOKEN,
              accessToken: accessToken.token,
            },
          },
          defaults: {
            from: process.env.MAILER_FROM,
          },
          template: {
            dir: join(__dirname, './templates'),
            adapter: new HandlebarsAdapter(helpers),
            options: {
              strict: true,
            },
          },
        }
      },
    }),
  ],
  controllers: [],
  providers: [MailService, PdfService],
  exports: [MailService, PdfService],
})
export class MailModule {}
