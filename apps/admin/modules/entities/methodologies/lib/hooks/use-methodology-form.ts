'use client';

import { useCallback, useState } from 'react';
import type { MethodologyConfig, MethodologyDetail } from '../../model';
import {
    formFromDetail,
    type MethodologyFormState,
} from '../methodology-form.state';

type MetaPatch = Partial<Pick<MethodologyFormState, 'scope' | 'portalDomain' | 'isActive'>>;

export interface MethodologyForm {
    state: MethodologyFormState;
    /** Заменить форму целиком (карточка загрузилась, режим сменился). */
    reset: (next: MethodologyFormState) => void;
    /** Поправить поля конфига; форма становится «с правками». */
    patchConfig: (patch: Partial<MethodologyConfig>) => void;
    /** Заменить конфиг целиком (JSON, черновик помощника). */
    setConfig: (config: MethodologyConfig) => void;
    /** Слой, портал, включена. */
    patchMeta: (patch: MetaPatch) => void;
    /** После сохранения: строка с id, правок нет. */
    markSaved: (detail: MethodologyDetail) => void;
}

/** Состояние формы методики с пометкой несохранённых правок. */
export const useMethodologyForm = (initial: MethodologyFormState): MethodologyForm => {
    const [state, setState] = useState<MethodologyFormState>(initial);

    const reset = useCallback((next: MethodologyFormState) => setState(next), []);
    const patchConfig = useCallback(
        (patch: Partial<MethodologyConfig>) =>
            setState(current => ({
                ...current,
                config: { ...current.config, ...patch },
                dirty: true,
            })),
        [],
    );
    const setConfig = useCallback(
        (config: MethodologyConfig) =>
            setState(current => ({ ...current, config, dirty: true })),
        [],
    );
    const patchMeta = useCallback(
        (patch: MetaPatch) =>
            setState(current => ({ ...current, ...patch, dirty: true })),
        [],
    );
    const markSaved = useCallback(
        (detail: MethodologyDetail) => setState(formFromDetail(detail, 'edit', undefined)),
        [],
    );

    return { state, reset, patchConfig, setConfig, patchMeta, markSaved };
};
