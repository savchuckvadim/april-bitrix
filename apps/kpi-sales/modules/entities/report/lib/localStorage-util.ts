const STORAGE_PREFIX = 'kpi-report-blocks-';

export interface BlockState {
    isVisible: boolean;
    isIncludedInExcel: boolean;
}

export const getBlockState = (blockId: string): BlockState => {
    if (typeof window === 'undefined') {
        return { isVisible: true, isIncludedInExcel: true };
    }

    try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${blockId}`);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error reading block state from localStorage:', error);
    }

    return { isVisible: true, isIncludedInExcel: true };
};

export const setBlockState = (blockId: string, state: BlockState): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(`${STORAGE_PREFIX}${blockId}`, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving block state to localStorage:', error);
    }
};

export const getAllBlockStates = (): Record<string, BlockState> => {
    if (typeof window === 'undefined') {
        return {};
    }

    const states: Record<string, BlockState> = {};
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                const blockId = key.replace(STORAGE_PREFIX, '');
                states[blockId] = getBlockState(blockId);
            }
        }
    } catch (error) {
        console.error('Error reading all block states from localStorage:', error);
    }

    return states;
};

