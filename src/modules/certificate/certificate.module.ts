import { Module, forwardRef } from '@nestjs/common'
import { CertificateService } from './certificate.service'
import { CertificateController } from './certificate.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Certificate } from './entities/certificate.entity'
import { MethodsModule } from '../methods/methods.module'

@Module({
  imports: [TypeOrmModule.forFeature([Certificate]), forwardRef(() => MethodsModule)],
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {}
