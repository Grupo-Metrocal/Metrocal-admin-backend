import { IsArray, IsEmail, IsString, ArrayNotEmpty, IsNotEmpty } from 'class-validator'

export class BulkEmailDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[]

  @IsString()
  @IsNotEmpty()
  subject: string

  @IsString()
  @IsNotEmpty()
  body: string
}
