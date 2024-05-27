import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ImagesService } from './images.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { handleBadrequest, handleOK } from 'src/common/handleHttp'
import * as path from 'path'
import { Response } from 'express'
import * as fs from 'fs'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.DESTINATION_CLOUD,
        filename: (req, file, cb) => {
          const filename: string = `${Date.now()}-${file.originalname}`
          cb(null, filename)
        },
      }),
    }),
  )
  @Post('upload')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return handleBadrequest(new Error('File is required'))
    }

    return handleOK({
      imageURL: `${process.env.BASE_URL}/images/image/${file.filename}`,
    })
  }

  @Get('image/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = path.join(process.env.DESTINATION_CLOUD, filename)

      console.log(filePath)
      if (!fs.existsSync(filePath)) {
        console.log('File not found')
        return res.status(404).send('File not found')
      }

      const stat = fs.statSync(filePath)

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Length': stat.size.toString(),
      })

      const readStream = fs.createReadStream(filePath)
      readStream.pipe(res)
    } catch (error) {
      console.error('Error:', error)
      res.status(500).send('Internal server error')
    }
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const filePath = path.join(process.env.DESTINATION_CLOUD, filename)

      if (!fs.existsSync(filePath)) {
        console.log('File not found')
        return res.status(404).send('File not found')
      }

      const stat = fs.statSync(filePath)

      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
        'Content-Disposition': `attachment; filename=${filename}`,
      })

      const readStream = fs.createReadStream(filePath)
      readStream.pipe(res)
    } catch (error) {
      console.error('Error:', error)
      res.status(500).send('Internal server error')
    }
  }

  @Get('delete/:filename')
  async deleteFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = path.join(process.env.DESTINATION_CLOUD, filename)

      if (!fs.existsSync(filePath))
        return res.status(404).send('File not found')

      fs.unlinkSync(filePath)

      res.status(200).send('File deleted')
    } catch (error) {
      console.error('Error:', error)
      res.status(500).send('Internal server error')
    }
  }
}
