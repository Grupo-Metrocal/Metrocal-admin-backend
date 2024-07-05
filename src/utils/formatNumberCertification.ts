export const formatNumberCertification = (number = 0, fraction = 1) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(number)
}
