import { Platform, NativeModules } from 'react-native';

// Get device locale
const getDeviceLocale = () => {
  let locale;
  
  if (Platform.OS === 'ios') {
    // iOS için daha güvenli locale tespiti
    locale = NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 'en-US';
  } else {
    // Android için mevcut yöntem
    locale = NativeModules.I18nManager.localeIdentifier;
  }

  // Locale formatını düzenle (tr_TR -> tr-TR)
  return locale.replace('_', '-');
};

// Default currency is USD
const DEFAULT_CURRENCY = 'USD';

// Currency mapping based on common locales
const LOCALE_CURRENCY_MAP = {
  'en-US': 'USD',
  'en-GB': 'GBP',
  'tr-TR': 'TRY',
  'de-DE': 'EUR',
  'fr-FR': 'EUR',
  'it-IT': 'EUR',
  'es-ES': 'EUR',
  'ja-JP': 'JPY',
};

// Get currency code based on locale
export const getCurrencyCode = () => {
  const locale = getDeviceLocale();
  return LOCALE_CURRENCY_MAP[locale] || DEFAULT_CURRENCY;
};

// Format price with currency symbol
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '';
  
  const locale = getDeviceLocale();
  const currencyCode = LOCALE_CURRENCY_MAP[locale] || DEFAULT_CURRENCY;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (error) {
    const symbol = getCurrencySymbol();
    return `${symbol}${price.toFixed(2)}`;
  }
};

// Get currency symbol only
export const getCurrencySymbol = () => {
  const currencyCode = getCurrencyCode();
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'TRY': '₺',
    'JPY': '¥',
  };
  return symbols[currencyCode] || '$';
}; 