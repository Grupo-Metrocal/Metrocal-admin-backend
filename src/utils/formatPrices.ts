export const formatPrice = (
  price = 0,
  currency = 0,
  changeCurrencyType = 'NIO',
  currencyType = 'NIO',
) => {
  if (changeCurrencyType === 'NIO' && currencyType === 'NIO')
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)

  if (changeCurrencyType === 'USD' && currencyType === 'NIO')
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price / currency)

  if (changeCurrencyType === 'USD' && currencyType === 'USD')
    return new Intl.NumberFormat('us-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)

  if (changeCurrencyType === 'NIO' && currencyType === 'USD')
    return new Intl.NumberFormat('us-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price * currency)
}
