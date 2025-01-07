import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import tr from './locales/tr.json';
import { getLocales } from 'react-native-localize';

const resources = {
  en: {
    translation: en
  },
  tr: {
    translation: tr
  }
};

const getDefaultLanguage = () => {
  const deviceLanguage = getLocales()[0].languageCode;
  return resources[deviceLanguage] ? deviceLanguage : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 