import { createI18n } from 'vue-i18n'
import { translations } from './translations'

const i18n = createI18n({
    legacy: false,
    locale: 'ko',
    fallbackLocale: 'en',
    messages: translations
})

export default i18n