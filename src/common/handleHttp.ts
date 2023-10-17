export type ResponseHTTP<T> = {
  status: number
  message: string
  data?: T | T[]
  details?: string
}

export const handleOK = <T>(data: T): ResponseHTTP<T> => {
  return {
    status: 200,
    message: 'OK',
    data,
  }
}

export const handleBadresuest = <T>(error: Error): ResponseHTTP<T> => {
  return {
    status: 400,
    message: 'Bad request',
    details: error.message,
  }
}

export const handleInternalServerError = <T>(data: T): ResponseHTTP<T> => {
  return {
    status: 500,
    message: 'Internal Server res',
    details: data as any,
  }
}
