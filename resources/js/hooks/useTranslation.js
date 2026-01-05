import { usePage } from '@inertiajs/react';

export default function useTranslation() {
    const { translations, locale } = usePage().props;

    const t = (key, replacements = {}) => {
        const keys = key.split('.');
        let translation = translations;

        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                return key;
            }
        }

        if (typeof translation === 'string') {
            Object.keys(replacements).forEach((r) => {
                translation = translation.replace(`:${r}`, replacements[r]);
            });
        }

        return translation;
    };

    return { t, locale };
}
