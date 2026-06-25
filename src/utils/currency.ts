export const SUPPORTED_CURRENCIES = [
  { code: 'ZAR', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'USD', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  { code: 'NGN', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'KES', name: 'Kenyan Shilling', locale: 'en-KE' },
  { code: 'INR', name: 'Indian Rupee', locale: 'en-IN' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

export const getCurrency = (code: string) =>
  SUPPORTED_CURRENCIES.find((currency) => currency.code === code) ?? SUPPORTED_CURRENCIES[0];

export const formatMoney = (amount: number, currencyCode: string) => {
  const currency = getCurrency(currencyCode);

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatExchangeRate = (rate: number, fromCurrency: string, toCurrency: string) =>
  `1 ${fromCurrency} = ${new Intl.NumberFormat(getCurrency(toCurrency).locale, {
    maximumFractionDigits: 6,
  }).format(Number.isFinite(rate) && rate > 0 ? rate : 1)} ${toCurrency}`;
