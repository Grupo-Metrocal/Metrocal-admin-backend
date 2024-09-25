export const formatPrice = (price = 0, currency = 0, currencyType = 'USD') => {
  if (currencyType === 'USD')
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price * currency)
}
