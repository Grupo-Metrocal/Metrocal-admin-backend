import { Module } from '@nestjs/common'
import { QuotesService } from './quotes.service'
import { QuotesController } from './quotes.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClientsService } from '../clients/clients.service'
import { Quote } from './entities/quote.entity'
import { QuoteRequest } from './entities/quote-request.entity'
import { EquipmentQuoteRequest } from './entities/equipment-quote-request.entity'
import { User } from '../users/entities/user.entity'
import { Client } from '../clients/entities/client.entity'
import { MailService } from '../mail/mail.service'
import { TokenService } from '../auth/jwt/jwt.service'
import { ConfigModule } from '@nestjs/config'
import { PdfService } from '../mail/pdf.service'
import { UsersService } from '../users/users.service'
import { ResetPassword } from '../users/entities/reset-password.entity'
import { Role } from '../roles/entities/role.entity'
import { RolesService } from '../roles/roles.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      Quote,
      QuoteRequest,
      EquipmentQuoteRequest,
      User,
      Client,
      ResetPassword,
      Role,
    ]),
  ],
  controllers: [QuotesController],
  providers: [
    QuotesService,
    ClientsService,
    MailService,
    TokenService,
    PdfService,
    UsersService,
    RolesService,
  ],
  exports: [QuotesService],
})
export class QuotesModule {}
