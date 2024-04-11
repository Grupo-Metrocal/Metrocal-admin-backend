import { Module } from '@nestjs/common'
import { CertificateService } from './certificate.service'
import { CertificateController } from './certificate.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Certificate } from './entities/certificate.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Certificate])],
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {}
