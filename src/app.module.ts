import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_POSTGRES_HOST,
      database: process.env.DB_POSTGRES_DB,
      port: parseInt(process.env.DB_POSTGRES_PORT),
      password: process.env.DB_POSTGRES_PASSWORD,
      username: process.env.DB_POSTGRES_USER,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      retryDelay: 3000,
      retryAttempts: 10,
      // ssl: {
      //   /* <----- Add SSL option */
      //   requestCert: true,
      //   rejectUnauthorized: false,
      // },
    }),
    UsersModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
