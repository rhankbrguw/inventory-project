import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useDebounce } from 'use-debounce';

function cleanQueryParams(params: Record<string, unknown>): Record<string, unknown> {
    const cleaned = { ...params };
    Object.keys(cleaned).forEach((key) => {
        if (cleaned[key] === '' || cleaned[key] === null || cleaned[key] === 'all' || cleaned[key] === undefined) {
            delete cleaned[key];
        }
    });

    return cleaned;
}

export function useIndexPageFilters<T extends Record<string, unknown>>(
    routeName: string,
    initialFilters: T = {} as T,
    _defaultSort?: string
) {
    const [params, setParams] = useState<T>(initialFilters);
    const [debouncedSearch] = useDebounce(params.search as string | undefined, 500);
    const isInitialMount = useRef(true);

    const otherFilters = { ...params };
    delete otherFilters.search;
    const otherFiltersString = JSON.stringify(otherFilters);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const queryParams = cleanQueryParams({ ...JSON.parse(otherFiltersString), search: debouncedSearch });

        router.get(route(routeName), queryParams as any, {
            preserveState: true,
            replace: true,
        });
    }, [debouncedSearch, otherFiltersString, routeName]);

    const setFilter = (key: keyof T | string, value: unknown) => {
        setParams((prevParams) => ({ ...prevParams, [key]: value }));
    };

    const isFiltered = Object.entries(params).some(([key, filterValue]) => {
        if (key === 'sort') return false;
        return filterValue !== '' && filterValue !== null && filterValue !== undefined && filterValue !== 'all';
    });

    return { params, setFilter, isFiltered };
}
