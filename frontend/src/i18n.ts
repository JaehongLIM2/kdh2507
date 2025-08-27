import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ja from "./locales/ja/common.json";
import ko from "./locales/ko/common.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ja: {translation: ja},
            ko: {translation: ko},
        },
        lng: "ja",             // 기본 언어: 일본어
        fallbackLng: "ja",     // 리소스 없을 때도 일본어로
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
        },
    });

export default i18n;
