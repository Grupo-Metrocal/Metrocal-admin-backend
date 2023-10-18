export type ResponseHTTP<T> = {
  status: number
  message: string
  success: boolean
  data?: T | T[]
  details?: string
}

export const handleOK = <T>(data: T): ResponseHTTP<T> => {
  return {
    status: 200,
    message: 'OK',
    success: true,
    data,
  }
}

export const handleBadrequest = <T>(error: Error): ResponseHTTP<T> => {
  return {
    status: 400,
    message: 'Bad request',
    success: false,
    details: error.message,
  }
}

export const handleInternalServerError = <T>(data: T): ResponseHTTP<T> => {
  return {
    status: 500,
    message: 'Internal server error',
    success: false,
    details: data as any,
  }
}
