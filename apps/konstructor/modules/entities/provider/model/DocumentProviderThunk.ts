import { resolveSwrCache, SWR_DAY_MS } from '@workspace/api';
import { readFieldValue } from '@workspace/pbx';
// Глубокий импорт файла-констант: баррель pbx-data тянет class-энтити
// (так же делают event-sales и client-card).
import { PBX_SALES_KONSTRUCTOR_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/konstructor/pbx-sales-konstructor-field.type';
import type { AppThunk } from '@/modules/app/model/store';
import { ProviderHelper } from '../lib/api/provider-helper';
import { ProviderSettingsHelper } from '../lib/api/provider-settings-helper';
import { resolveCurrentProvider } from '../lib/resolve-current-provider.util';
import type { Provider } from './dto';
import { documentProvidertAC } from './DocumentProviderSlice';

/** Версия схемы списка в кэше: меняем вместе с формой ProviderWithRqResponseDto. */
const PROVIDERS_CACHE_VERSION = 1;

const helper = new ProviderHelper();
const settings = new ProviderSettingsHelper();

const errorText = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

/**
 * Поставщики портала с нашего бэка через swrCache + поставщик по умолчанию
 * из настроек пользователя. Поле сделки подхватывается отдельно слушателем,
 * когда загружен портал (applyDealProvider).
 */
export const initProviders =
    (domain: string, bxUserId: number): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        dispatch(documentProvidertAC.loading());
        try {
            const [{ value: providers }, preferredId] = await Promise.all([
                resolveSwrCache<Provider[]>({
                    key: {
                        name: 'providers',
                        domain,
                        version: PROVIDERS_CACHE_VERSION,
                    },
                    staleAfterMs: SWR_DAY_MS,
                    fetcher: () => helper.list(domain),
                    onUpdate: fresh =>
                        dispatch(
                            documentProvidertAC.setFetched({
                                providers: fresh,
                                currentId:
                                    getState().documentProvider.current?.id ??
                                    null,
                            }),
                        ),
                }),
                settings.readProviderId(domain, bxUserId),
            ]);
            dispatch(
                documentProvidertAC.setFetched({
                    providers,
                    currentId:
                        resolveCurrentProvider(providers, null, preferredId)?.id ??
                        null,
                }),
            );
        } catch (error) {
            dispatch(
                documentProvidertAC.failed(
                    errorText(error, 'поставщики не загружены'),
                ),
            );
        }
    };

/**
 * Поставщик, записанный в сделке (`document_provider` хранит название), —
 * сильнее настройки пользователя. Зовётся слушателем, когда известны и
 * портал (ключ поля), и список поставщиков.
 */
export const applyDealProvider = (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { items, current } = state.documentProvider;
    if (!items.length) return;

    const dealProviderName = readFieldValue(
        state.portal.current?.bitrixDeal?.bitrixfields,
        state.app.bitrix.deal as Record<string, unknown> | null,
        PBX_SALES_KONSTRUCTOR_FIELD_CODES.document_provider,
    );
    const resolved = resolveCurrentProvider(
        items,
        typeof dealProviderName === 'string' ? dealProviderName : null,
        current?.id ?? null,
    );
    if (resolved && resolved.id !== current?.id) {
        dispatch(documentProvidertAC.setCurrent(resolved.id));
    }
};

/**
 * Выбор поставщика менеджером: сразу в состояние, в фоне — в настройки
 * пользователя (дефолт на следующий раз). В сделку поставщик уходит вместе
 * с отправкой сделки (deal-send, поле `document_provider`).
 */
export const setCurrentProvider =
    (providerId: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        dispatch(documentProvidertAC.setCurrent(providerId));
        const { domain, bitrix } = getState().app;
        const bxUserId = Number(bitrix.user?.ID);
        if (!domain || !Number.isFinite(bxUserId)) return;
        try {
            await settings.writeProviderId(domain, bxUserId, providerId);
        } catch (error) {
            console.warn('provider: настройка пользователя не сохранена', error);
        }
    };
