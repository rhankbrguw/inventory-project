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

function applyReplacements(text: string, replacements: TranslationReplacements): string {
    let result = text;
    Object.keys(replacements).forEach((r) => {
        result = result.replace(`:${r}`, String(replacements[r]));
    });
    return result;
}

function resolveTranslation(translations: TranslationMap, key: string, replacements: TranslationReplacements): string {
    if (!translations || typeof translations !== 'object') {
        return key;
    }

    const keys = key.split('.');
    let current: TranslationValue = translations;

    for (const k of keys) {
        if (!current || typeof current === 'string' || current[k] === undefined) {
            return key;
        }
        current = current[k];
    }

    return typeof current === 'string' ? applyReplacements(current, replacements) : key;
}

export default function useTranslation() {
    const pageProps = usePage<Partial<TranslationProps>>().props;
    const translations: TranslationMap = pageProps?.translations || {};
    const locale: string = pageProps?.locale || 'id';

    const t = (key: string, replacements: TranslationReplacements = {}): string =>
        resolveTranslation(translations, key, replacements);

    return { t, locale };
}
