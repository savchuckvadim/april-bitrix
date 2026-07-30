'use client';

import { useEffect, useState } from 'react';
import {
    listFlowVariantIds,
    subscribeFlowVariants,
} from '../lib/flow-variant-storage';

/** Живое число сохранённых вариантов схем на странице. */
export const useFlowVariantCount = (): number => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const update = () => setCount(listFlowVariantIds().length);
        update();
        return subscribeFlowVariants(update);
    }, []);

    return count;
};
