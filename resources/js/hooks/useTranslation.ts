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
    const { translations, locale } = usePage<TranslationProps>().props;

    const t = (key: string, replacements: TranslationReplacements = {}): string => {
        const keys = key.split('.');
        let translation: TranslationValue = translations;

        for (const k of keys) {
            if (typeof translation === 'string' || translation[k] === undefined) {
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
