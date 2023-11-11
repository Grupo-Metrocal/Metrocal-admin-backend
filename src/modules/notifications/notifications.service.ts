import { Injectable } from '@nestjs/common'
import * as admin from 'firebase-admin'

@Injectable()
export class NotificationsService {
  private readonly messaging: admin.messaging.Messaging

  constructor() {
    this.messaging = admin.messaging()
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data: any,
  ) {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      data,
    }

    try {
      const response = await this.messaging.send(message)
      console.log('Successfully sent message:', response)
    } catch (error) {
      console.log('Error sending message:', error)
    }
  }
}
