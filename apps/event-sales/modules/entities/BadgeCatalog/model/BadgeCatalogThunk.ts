import type { AppThunk } from '@/modules/app/model/store';
import { BadgeCatalogHelper } from '../lib/api/badge-catalog-helper';
import { normalizeBadgeCatalog } from '../lib/badge-catalog-normalize';
import { badgeCatalogActions } from './BadgeCatalogSlice';

const helper = new BadgeCatalogHelper();

/**
 * Каталог бейджиков домена. Fail-open: ошибка сети или чужой контракт —
 * бейджиков нет, предупреждение в консоль, статус `error`. На экране ничего
 * не ломается: бейджик — подсказка, не условие отправки.
 */
export const fetchBadgeCatalog =
    (domain: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        if (getState().badgeCatalog.status === 'loading') return;
        if (!domain) {
            console.warn('бейджики: домен не известен, набор не загружен');
            dispatch(badgeCatalogActions.failed());
            return;
        }

        dispatch(badgeCatalogActions.pending({ domain }));
        try {
            const dto = await helper.getCatalog(domain);
            const { mode, items, warnings } = normalizeBadgeCatalog(dto);
            for (const warning of warnings) console.warn('бейджики:', warning);
            console.info('бейджики', domain, mode, dto.hash, items.length);
            dispatch(
                badgeCatalogActions.fulfilled({
                    contract: dto.contract,
                    version: dto.version,
                    hash: dto.hash,
                    mode,
                    items,
                }),
            );
        } catch (error) {
            console.warn('бейджики недоступны, менеджер пишет сам', error);
            dispatch(badgeCatalogActions.failed());
        }
    };

/**
 * Точка входа init-цикла. Состав перечитывается только при смене портала
 * или расхождении хэша: ⟳ прогоняет init заново, и наивный повтор давал бы
 * лишний запрос на каждое обновление карточки. Сверка — лёгким `/version`.
 */
export const ensureBadgeCatalog =
    (domain: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const catalog = getState().badgeCatalog;
        if (catalog.status === 'loading') return;

        if (catalog.status === 'idle' || catalog.domain !== domain || !domain) {
            await dispatch(fetchBadgeCatalog(domain));
            return;
        }

        try {
            const { hash } = await helper.getVersion(domain);
            if (!hash || hash === catalog.hash) return;
            console.info('бейджики: набор портала изменился', hash);
            await dispatch(fetchBadgeCatalog(domain));
        } catch (error) {
            console.warn('бейджики: версию не проверить, действует прежний набор', error);
        }
    };
