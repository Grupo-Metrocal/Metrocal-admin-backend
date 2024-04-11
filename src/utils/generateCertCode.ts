interface GenerateCertCodeProps {
  id: number
  modificationsNumber: number
  prefix: string
}
export const generateCertCode = ({
  id,
  modificationsNumber,
  prefix,
}: GenerateCertCodeProps) => {
  const year = new Date().getFullYear()
  return `NI-MC-${prefix}-${id
    .toString()
    .padStart(4, '0')}-${modificationsNumber
    .toString()
    .padStart(2, '0')}-${year}`
}
