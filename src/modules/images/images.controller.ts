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
import { handleOK } from 'src/common/handleHttp'
import * as path from 'path'
import { Response } from 'express'
import * as fs from 'fs'

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'C:/Users/MSI GF63/Desktop/REGXI/uploads',
        filename: (req, file, cb) => {
          const filename: string = `${Date.now()}-${file.originalname}`
          cb(null, filename)
        },
      }),
    }),
  )
  @Post('file')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return handleOK({
      imageURL: `${process.env.BASE_URL}/images/image/${file.filename}`,
    })
  }

  @Get('image/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(
      'C:/Users/MSI GF63/Desktop/REGXI/uploads',
      filename,
    )

    console.log(filePath)
    try {
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
}
