import { Injectable } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class TokenService {
  private readonly secretKey = process.env.JWT_SECRET

  generateTemporaryLink(id: number, expiresIn: string): string {
    if (!id || !expiresIn) {
      throw new Error('Faltan parámetros')
    }

    return jwt.sign({ id }, this.secretKey, { expiresIn })
  }

  verifyTemporaryLink(token: string): { id: number } {
    try {
      return jwt.verify(token, this.secretKey) as { id: number }
    } catch (error) {
      return {
        id: null,
      }
    }
  }

  decodeToken(token: string) {
    try {
      return jwt.decode(token)
    } catch (error) {
      return null
    }
  }
}
