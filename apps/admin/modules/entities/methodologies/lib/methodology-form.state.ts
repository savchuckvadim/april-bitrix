import {
    METHODOLOGIES_TEXT,
    type MethodologyConfig,
    type MethodologyDetail,
    type MethodologySave,
    type MethodologyScope,
    type MethodologySource,
} from '../model';
import {
    copyConfig,
    emptyConfig,
    isValidMethodologyCode,
} from './methodology-form.util';

/** Режим редактора: новая, правка строки или копия как своя. */
export type MethodologyEditorMode = 'new' | 'edit' | 'copy';
export type MethodologyFormSource = MethodologySource | 'new';

/** Состояние формы методики: строка (id, слой, портал, включена) и конфиг. */
export interface MethodologyFormState {
    id: string | null;
    scope: MethodologyScope;
    portalDomain: string | null;
    isActive: boolean;
    source: MethodologyFormSource;
    config: MethodologyConfig;
    dirty: boolean;
}

/** Пустая форма: с выбранным порталом — своя методика портала, без — общая. */
export const initialFormState = (
    domain: string | undefined,
): MethodologyFormState => ({
    id: null,
    scope: domain ? 'portal' : 'common',
    portalDomain: domain ?? null,
    isActive: true,
    source: 'new',
    config: emptyConfig(),
    dirty: false,
});

/** Форма из карточки: правка строки как есть или копия как новая методика. */
export const formFromDetail = (
    detail: MethodologyDetail,
    mode: MethodologyEditorMode,
    domain: string | undefined,
): MethodologyFormState => {
    if (mode === 'copy') {
        return {
            ...initialFormState(domain),
            source: 'new',
            config: copyConfig(
                detail.config,
                `${detail.code}-copy`,
                `${detail.title}${METHODOLOGIES_TEXT.copySuffix}`,
            ),
            dirty: true,
        };
    }
    return {
        id: detail.id,
        scope: detail.scope,
        portalDomain: detail.portalDomain,
        isActive: detail.isActive,
        source: detail.source,
        config: detail.config,
        dirty: false,
    };
};

/** Тело сохранения: у общего слоя портал не передаётся. */
export const toSaveBody = (state: MethodologyFormState): MethodologySave => ({
    id: state.id,
    scope: state.scope,
    portalDomain: state.scope === 'portal' ? state.portalDomain : null,
    isActive: state.isActive,
    config: state.config,
});

/** Сохранять можно: код по шаблону, название есть, у своей методики выбран портал. */
export const canSave = (state: MethodologyFormState): boolean =>
    isValidMethodologyCode(state.config.code) &&
    state.config.title.trim() !== '' &&
    (state.scope !== 'portal' || Boolean(state.portalDomain));

/** Причина, почему сохранить нельзя; null — можно. */
export const saveBlocker = (state: MethodologyFormState): string | null => {
    if (!isValidMethodologyCode(state.config.code)) return METHODOLOGIES_TEXT.editor.codeHint;
    if (state.config.title.trim() === '') return METHODOLOGIES_TEXT.editor.name;
    if (state.scope === 'portal' && !state.portalDomain) {
        return METHODOLOGIES_TEXT.editor.noDomainForPortal;
    }
    return null;
};

/** Дата и автор правки строки для таблицы; у встроенной — прочерк. */
export const formatUpdated = (
    updatedAt: string | null,
    updatedBy: string | null,
): string => {
    if (!updatedAt) return '—';
    const date = new Date(updatedAt);
    const stamp = Number.isNaN(date.getTime())
        ? updatedAt
        : date.toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          });
    return updatedBy ? `${stamp}, ${updatedBy}` : stamp;
};

/** Что открыто в редакторе: новая, правка строки/встроенной или копия. */
export type EditorSelection =
    | { mode: 'new' }
    | { mode: Exclude<MethodologyEditorMode, 'new'>; id: string | null; code: string };
