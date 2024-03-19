export type ResponseHTTP<T> = {
  status: number
  message: string
  success: boolean
  data?: T | T[]
  details?: string
  limit?: number
  current_page?: number
  total_pages?: number
  total_data?: number
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

export const handlePaginate = <T>(
  data: T,
  total: number,
  limit: number,
  offset: number,
): ResponseHTTP<T> => {
  return {
    status: 200,
    message: 'OK',
    success: true,
    limit: +limit,
    current_page: +offset,
    total_pages: Math.ceil(total / limit),
    total_data: total,
    data,
  }
}

export const handlePaginateByPageNumber = <T>(
  data: T[],
  limit: number,
  pageNumber: number,
): ResponseHTTP<T[]> => {
  const total = data.length
  const totalPages = Math.ceil(total / limit)

  // Verifica si el número de página solicitado es válido
  if (pageNumber < 1 || pageNumber > totalPages) {
    return {
      status: 400,
      message: `Número de página inválido. Debe estar entre 1 y ${totalPages}.`,
      success: false,
      limit: limit,
      current_page: pageNumber,
      total_pages: totalPages,
      total_data: total,
      data: [],
    }
  }

  const offset = (pageNumber - 1) * limit
  const paginatedData = data.slice(offset, offset + limit)

  return {
    status: 200,
    message: 'OK',
    success: true,
    limit: limit,
    current_page: pageNumber,
    total_pages: totalPages,
    total_data: total,
    data: paginatedData,
  }
}
