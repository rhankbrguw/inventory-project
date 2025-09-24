import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { useDebounce } from "use-debounce";

export const useIndexPageFilters = (routeName, filters = {}) => {
    const [params, setParams] = useState(filters);
    const [debouncedSearch] = useDebounce(params.search, 500);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const queryParams = { ...params };
        queryParams.search = debouncedSearch;

        Object.keys(queryParams).forEach((key) => {
            if (
                queryParams[key] === "" ||
                queryParams[key] === null ||
                queryParams[key] === "all"
            ) {
                delete queryParams[key];
            }
        });

        router.get(route(routeName), queryParams, {
            preserveState: true,
            replace: true,
        });
    }, [debouncedSearch, params.sort, params.location_id, params.type_id, params.group, params.role]);

    const setFilter = (key, value) => {
        setParams((prevParams) => ({ ...prevParams, [key]: value }));
    };

    return {
        params,
        setFilter,
    };
};
