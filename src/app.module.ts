import { Module, forwardRef } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './modules/users/users.module'
import { RolesModule } from './modules/roles/roles.module'
import { AuthModule } from './modules/auth/auth.module'
import { MailModule } from './modules/mail/mail.module'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { configEnv } from './configEnv'
import { QuotesModule } from './modules/quotes/quotes.module'
import { ClientsModule } from './modules/clients/clients.module'
import { ActivitiesModule } from './modules/activities/activities.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(configEnv as TypeOrmModuleOptions),
    UsersModule,
    RolesModule,
    AuthModule,
    MailModule,
    QuotesModule,
    ClientsModule,
    ActivitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
