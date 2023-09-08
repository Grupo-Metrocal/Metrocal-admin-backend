import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  const config = new DocumentBuilder()
    .setTitle('METROCAL')
    .setDescription('The METROCAL APIs description')
    .setVersion('1.0')
    .addTag('metrocal')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())
  // app.setGlobalPrefix('api')

  await app.listen(3000)
}
bootstrap()
