interface GenerateCertCodeProps {
  id: number
  prefix: string
}
export const generateCertCode = ({
  id,
  prefix,
}: GenerateCertCodeProps) => {
  const year = new Date().getFullYear()
  return `NI-MC-${prefix}-${id
    .toString()
    .padStart(4, '0')}-${year}`
}

export const formatCertCode = (code: string, modificationsNumber: number) => {
  if (modificationsNumber === 0 || modificationsNumber === null) {
    return code
  }

  const parts = code.split('-')
  const id = parts[3]
  return code.replace(id, `${id}-${modificationsNumber}`)
}

export const getCertCodeId = (code: string) => {
  if (!code) {
    return '0'
  }

  const parts = code.split('-')
  const id = parts[3]

  return id
}