export const formatPrice = (price = 0, currency = 0, currencyType = 'NIO') => {
  if (currencyType === 'NIO')
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price / currency)
}
