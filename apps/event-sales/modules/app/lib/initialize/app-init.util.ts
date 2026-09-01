import { Bitrix } from '@workspace/bitrix';
import { BXTask, BXUser, Placement } from '@workspace/bx';
import { portalAPI } from '@workspace/pbx';
import {
    TESTING_DOMAIN,
    TESTING_PLACEMENT,
    TESTING_USER,
} from '../../consts/app-global';
import { appActions } from '../../model/slice/AppSlice';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import type { AppDispatch, AppGetState } from '../../model/store';
import {
    getDisplayMode,
    getEntitiesFromPlacement,
} from '../utills/placement-util';
import { initAppEntities, initAppTask } from '../utills/app-setup-util';
import {
    getDepartment,
    setDepartmentMode,
} from '@/modules/features/Departament/model/DepartmentThunk';
import { fetchAppConfig } from '../../model/thunk/AppConfigThunk';
// Прямой путь: барель каталога анкет тянет транспорт и данные.
import { ensureQuestionnaireCatalog } from '@/modules/entities/Questionnaire/model/QuestionnaireCatalogThunk';
import { markBootPhase } from '../diagnostics/boot-phases';
import { armBootMetricsWatchdog } from '../diagnostics/boot-metrics';

/**
 * Boot-последовательность приложения (паттерн: тонкий thunk +
 * этот util). `Bitrix.start` прозрачно работает в обоих режимах:
 * во фрейме Bitrix берёт реальные domain/user/placement, локально (без
 * клиентского Bitrix в браузере) — падает на переданные TESTING_*.
 * Режим виден по `inFrame` из `getInitializedData()`.
 *
 * Побочные реакции на загруженные данные (портал → компания и т.п.)
 * живут в listeners (model/listeners), а не во вложенных thunk'ах.
 */
export const appInit = async (dispatch: AppDispatch, getState: AppGetState) => {
    markBootPhase('init-start');
    // Сторож замера — ПЕРВЫМ делом, до единого `await`. Штатный отчёт висит
    // на терминальном действии инициализации, но встать насмерть бут умеет
    // прямо здесь: `Bitrix.start` или резолв сущностей ниже могут не
    // вернуться никогда, и тогда ни одного действия не диспатчится. Именно
    // такие буты («у менеджера ничего не грузится») раньше не отправляли
    // вообще ничего — мерились одни выжившие. Домен читается лениво: сейчас
    // он ещё неизвестен, а к моменту срабатывания обычно уже в сторе.
    armBootMetricsWatchdog(() => getState().app.domain);
    const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
    markBootPhase('bitrix-started');
    // fitWindow здесь НЕ зовём: на старте ещё нечего мерить, а во встройке
    // таймлайна он вообще запрещён. Подгонкой занимается useFitWindow —
    // после отрисовки и только для вкладок карточки (см. shouldFitWindow).

    const {
        domain: authDomain,
        user: authUser,
        inFrame,
    } = bitrix.api.getInitializedData();
    const domain = authDomain || TESTING_DOMAIN;
    const user = (authUser ?? TESTING_USER) as unknown as BXUser;
    const placement = (bitrix.api.getPlacement() ??
        TESTING_PLACEMENT) as Placement;

    if (!inFrame) {
        console.info(`app-init: вне фрейма Bitrix — dev-режим (${domain})`);
    }

    dispatch(setDepartmentMode(user, domain));

    // РАННИЙ СТАРТ НЕЗАВИСИМЫХ ЦЕПОЧЕК. Порталу, настройкам, каталогу анкет
    // и отделу нужен только домен — он известен сразу после Bitrix.start,
    // и ждать резолва сущностей (1–3 последовательных запроса к Bitrix ниже)
    // этим запросам незачем: раньше они стартовали листенером на setAppData
    // и удлиняли путь до списка дел на те же раунды.
    //
    // setDomain — строго ПЕРЕД ними: он пересобирает доменный конфиг (эта
    // обязанность переехала сюда из setAppData), и патч портальных настроек
    // обязан лечь поверх него, а не быть стёртым им. Дублей на ⟳ нет:
    // единственная точка диспатча цепочек — этот файл, а ходить ли в сеть,
    // решают сами цепочки (swr-кэш у портала и настроек, сверка версии у
    // каталога анкет — см. ensureQuestionnaireCatalog).
    dispatch(appActions.setDomain({ domain, user }));
    dispatch(fetchAppConfig(domain));
    dispatch(ensureQuestionnaireCatalog(domain));
    // Слепок портала: кэш-первым, обновление тихо в фоне (см. PortalService).
    // Не ждём намеренно — со второго запуска слепок приходит из браузерного
    // кэша почти сразу, а первый запуск не должен упираться в сеть: гвард
    // чужой задачи и инициализация компании висят листенерами на setPortal
    // (оба дожидаются резолва сущностей сами).
    dispatch(portalAPI.endpoints.fetchPortal.initiate({ domain }));
    dispatch(getDepartment(domain, user));

    // Resolve the CRM entities for the current placement via @workspace/bitrix services.
    const entities = await getEntitiesFromPlacement(placement, domain);
    markBootPhase('entities-resolved');
    const display = getDisplayMode(placement);

    // Сделка без компании и чистый лид — легальные контексты. Падаем только
    // когда не нашлось вообще ни одной сущности-владельца.
    if (
        !entities.currentCompany &&
        !entities.currentLead &&
        !entities.currentDeal
    ) {
        // Встройка задачи с битыми привязками (сделку/компанию удалили) —
        // не техническая ошибка, а честная заглушка: работать не с чем.
        if (display === APP_DISPLAY_MODE.TASK && entities.currentTask) {
            dispatch(appActions.setGuard('noTaskEntity'));
            markBootPhase('splash-off');
            dispatch(appActions.setInitializedSuccess({}));
            return;
        }
        dispatch(
            appActions.setInitializedError({
                errorMessage:
                    'Не найдена сущность контекста (компания/сделка/лид)',
            }),
        );
        return;
    }

    initAppEntities(dispatch, entities, domain, user, placement, display);

    const userId = Number(user?.ID || TESTING_USER.ID);
    const companyId = Number(entities.currentCompany?.ID || 0);
    const leadId = Number(entities.currentLead?.ID || 0);
    const dealId = Number(entities.currentDeal?.ID || 0);
    const from = entities.from;

    initAppTask(
        dispatch,
        entities.currentTask as unknown as BXTask | null,
        domain,
        userId,
        companyId,
        leadId,
        dealId,
        from,
    );

    // Портал, настройки, каталог анкет и отдел уже в пути — их старт
    // поднят выше, к моменту, когда стал известен домен.
    markBootPhase('splash-off');
    dispatch(appActions.setInitializedSuccess({}));
};
