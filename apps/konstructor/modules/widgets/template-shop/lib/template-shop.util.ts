import type { WordTemplateSummary } from '@/modules/entities/offer-template-word';

/** Вкладки витрины: что показывать. */
export type TemplateShopScope = 'all' | 'mine' | 'favorites' | 'portal' | 'public';

export const TEMPLATE_SHOP_SCOPES: { value: TemplateShopScope; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'favorites', label: 'Избранные' },
    { value: 'mine', label: 'Мои' },
    { value: 'portal', label: 'Портала' },
    { value: 'public', label: 'Общедоступные' },
];

export interface TemplateShopViewer {
    userId: number;
    isSuperUser: boolean;
    favorites: string[];
    selectedId: string | null;
}

const visibilityOf = (template: WordTemplateSummary): string => String(template.visibility).toLowerCase();

export const isPublicTemplate = (template: WordTemplateSummary): boolean =>
    visibilityOf(template) === 'public';

const inScope = (template: WordTemplateSummary, scope: TemplateShopScope, viewer: TemplateShopViewer): boolean => {
    switch (scope) {
        case 'mine':
            return template.user_id === viewer.userId;
        case 'favorites':
            return viewer.favorites.includes(String(template.id));
        case 'portal':
            return visibilityOf(template) === 'private';
        case 'public':
            return isPublicTemplate(template);
        default:
            return true;
    }
};

const matches = (template: WordTemplateSummary, query: string): boolean => {
    if (!query) return true;
    return [template.name, template.tags, template.code]
        .filter(Boolean)
        .some(text => String(text).toLowerCase().includes(query));
};

/** Ранг в выдаче: выбранный, избранные, «по умолчанию», остальные. */
const rank = (template: WordTemplateSummary, viewer: TemplateShopViewer): number => {
    if (String(template.id) === viewer.selectedId) return 0;
    if (viewer.favorites.includes(String(template.id))) return 1;
    if (template.is_default) return 2;
    return 3;
};

/** Витрина: без архивных и выключенных, по вкладке и поиску, в порядке ранга и имени. */
export const filterShopTemplates = (
    templates: WordTemplateSummary[],
    scope: TemplateShopScope,
    search: string,
    viewer: TemplateShopViewer,
): WordTemplateSummary[] => {
    const query = search.trim().toLowerCase();
    return templates
        .filter(template => template.is_active !== false && !template.is_archived)
        .filter(template => inScope(template, scope, viewer) && matches(template, query))
        .sort(
            (a, b) =>
                rank(a, viewer) - rank(b, viewer) || a.name.localeCompare(b.name, 'ru'),
        );
};

/** Править и удалять: общедоступный — только суперпользователь April, остальные — как раньше. */
export const canManageTemplate = (template: WordTemplateSummary, viewer: TemplateShopViewer): boolean =>
    isPublicTemplate(template) ? viewer.isSuperUser : true;

/** Своё превью: суперпользователь — любому шаблону, автор — своему. */
export const canManagePreview = (template: WordTemplateSummary, viewer: TemplateShopViewer): boolean =>
    viewer.isSuperUser || (!isPublicTemplate(template) && template.user_id === viewer.userId);

/** Подпись видимости на карточке. */
export const visibilityLabel = (template: WordTemplateSummary): string => {
    switch (visibilityOf(template)) {
        case 'public':
            return 'Общедоступный';
        case 'private':
            return 'Портала';
        default:
            return 'Мой';
    }
};
