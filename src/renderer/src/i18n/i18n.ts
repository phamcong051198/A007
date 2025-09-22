import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import MAIN_EN from '@renderer/locales/en/main.json'
import MAIN_VI from '@renderer/locales/vi/main.json'

import SETTING_EN from '@renderer/locales/en/setting.json'
import SETTING_VI from '@renderer/locales/vi/setting.json'

export const resources = {
  en: {
    main: MAIN_EN,
    setting: SETTING_EN
  },
  vi: {
    main: MAIN_VI,
    setting: SETTING_VI
  }
}
export const defaultNS = 'main,setting'
i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  ns: ['main', 'setting'],
  fallbackLng: 'en',
  defaultNS,
  interpolation: {
    escapeValue: false
  }
})

export default i18n
