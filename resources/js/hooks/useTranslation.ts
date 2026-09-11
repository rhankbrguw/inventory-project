import { usePage } from '@inertiajs/react';

interface TranslationMap {
    [key: string]: string | TranslationMap;
}

type TranslationValue = string | TranslationMap;
type TranslationReplacements = Record<string, string | number>;
type TranslationProps = {
    translations: TranslationMap;
    locale: string;
};

export default function useTranslation() {
    const pageProps = usePage<Partial<TranslationProps>>().props;
    const translations: TranslationMap = pageProps?.translations || {};
    const locale: string = pageProps?.locale || 'id';

    const t = (key: string, replacements: TranslationReplacements = {}): string => {
        if (!translations || typeof translations !== 'object') {
            return key;
        }

        const keys = key.split('.');
        let translation: TranslationValue = translations;

        for (const k of keys) {
            if (!translation || typeof translation === 'string' || translation[k] === undefined) {
                return key;
            }

            translation = translation[k];
        }

        if (typeof translation === 'string') {
            let result = translation;
            Object.keys(replacements).forEach((r) => {
                result = result.replace(`:${r}`, String(replacements[r]));
            });
            return result;
        }

        return key;
    };

    return { t, locale };
}
