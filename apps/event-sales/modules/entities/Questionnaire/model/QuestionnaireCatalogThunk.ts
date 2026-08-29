import type { AppThunk } from '@/modules/app/model/store';
import { QuestionnaireHelper } from '../lib/api/questionnaire-helper';
import { normalizeQuestionnaireCatalog } from '../lib/questionnaire-normalize';
import { questionnaireCatalogActions } from './QuestionnaireCatalogSlice';

const helper = new QuestionnaireHelper();

/**
 * Портальный каталог анкет на домене.
 *
 * Fail-open по построению: ошибка сети, чужой контракт, пустой ответ и
 * полный отсев состава ведут в одно и то же место — встроенный набор,
 * предупреждение в консоль и статус `error`. Никакого исключения наружу и
 * никакой ошибки на экране: каталог — источник ВОПРОСОВ, а не разрешения
 * отправить отчёт, и его недоступность не должна останавливать работу.
 *
 * Сегодня fallback — основной сценарий: миграция таблиц ещё не накатана и
 * эндпоинт отвечает 500.
 */
export const fetchQuestionnaireCatalog =
    (domain: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        if (getState().questionnaireCatalog.status === 'loading') return;

        if (!domain) {
            // Без домена бэк отвечает 400 — незачем ни ходить, ни заставлять
            // waitForQuestionnaireCatalog ждать заведомо пустой запрос.
            console.warn(
                'каталог анкет: домен не известен, действует встроенный набор',
            );
            dispatch(questionnaireCatalogActions.failed());
            return;
        }

        dispatch(questionnaireCatalogActions.pending({ domain }));
        try {
            const dto = await helper.getCatalog(domain);
            const { defs, warnings } = normalizeQuestionnaireCatalog(dto);
            for (const warning of warnings) {
                console.warn('каталог анкет:', warning);
            }
            if (defs.length === 0) {
                // Портал анкет не завёл (законный пустой ответ) либо весь
                // состав неисполним — и то, и другое означает «работаем на
                // встроенном наборе».
                console.info(
                    'каталог анкет: портальных анкет нет, действует встроенный набор',
                );
                dispatch(questionnaireCatalogActions.failed());
                return;
            }
            // Видно в консоли фрейма, что именно приехало с портала: без
            // этого «анкеты не применились» неотличимо от «анкеты такие же».
            console.info(
                'каталог анкет',
                domain,
                dto.hash,
                defs.map(def => def.code),
            );
            dispatch(
                questionnaireCatalogActions.fulfilled({
                    contract: dto.contract,
                    version: dto.version,
                    hash: dto.hash,
                    defs,
                }),
            );
        } catch (error) {
            console.warn(
                'каталог анкет недоступен, действует встроенный набор',
                error,
            );
            dispatch(questionnaireCatalogActions.failed());
        }
    };

/**
 * Каталог анкет для текущего домена — точка входа init-цикла (листенер на
 * setAppData).
 *
 * Состав перечитывается ТОЛЬКО при смене портала или при расхождении хэша.
 * Причина: кнопка ⟳ прогоняет весь init заново (reloadApp гасит
 * app.initialized, useApp перезапускает initial()), и наивный повторный
 * fetch давал бы лишний запрос состава на каждое обновление карточки —
 * притом что анкеты портала за время звонка не меняются.
 *
 * Сверка идёт лёгким `/version` (только version+hash, без состава):
 * совпал хэш — не трогаем ни сеть, ни стор, вопросы на экране не мигают.
 * Тот же запрос служит и пробой «бэк ожил»: после провала хэш в сторе
 * пуст, поэтому первый удачный ответ версии тянет полный состав.
 *
 * Провал сверки — тихий: действует тот состав, что уже в руках.
 */
export const ensureQuestionnaireCatalog =
    (domain: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const catalog = getState().questionnaireCatalog;
        // Запрос уже идёт (двойной init) — второй не нужен.
        if (catalog.status === 'loading') return;

        // Первый заход или другой портал — читаем состав целиком. Пустой
        // домен fetch короткозамкнёт сам (бэк ответил бы 400).
        if (catalog.status === 'idle' || catalog.domain !== domain || !domain) {
            await dispatch(fetchQuestionnaireCatalog(domain));
            return;
        }

        try {
            const { hash } = await helper.getVersion(domain);
            if (!hash || hash === catalog.hash) return;
            console.info('каталог анкет: состав портала изменился', hash);
            await dispatch(fetchQuestionnaireCatalog(domain));
        } catch (error) {
            console.warn(
                'каталог анкет: версию не проверить, действует прежний состав',
                error,
            );
        }
    };
