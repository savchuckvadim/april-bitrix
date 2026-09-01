import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import type { BXTask } from '@workspace/bx';
import { waitForAppConfig } from '@/modules/app/lib/utills/app-config-wait';
import { EventTask } from '../types/event-task-type';
import { eventTaskActions } from './EventTaskSlice';
import { getEvTasksFromBxTasks } from '../lib/task-util';
import { EVENT_TASK_SELECT } from '../lib/task-select';
import { setCurrentReportContact } from '@/modules/entities/EventContact/model/EventContactThunk';
import { APP_FROM_ENUM } from '@/modules/app/model/slice/AppSlice';
import { markBootPhase } from '@/modules/app/lib/diagnostics/boot-phases';

/**
 * Инициализация списка задач из уже известной текущей задачи
 * (placement TASK / CALL_CARD).
 * Реакции на setFetchedTasks (getInitSale и т.п.) — в store-listeners.
 */
export const initialTasksFromCurrentTask =
    (tasks: Array<EventTask>) => async (dispatch: AppDispatch) => {
        const currentTask = tasks?.[0];
        if (currentTask) {
            // Список дошёл до терминального состояния и на этом пути тоже.
            // Пока метка стояла только в сетевой ветке, для ВСЕГО семейства
            // встроек TASK / CALL_CARD главная цифра владельца не
            // публиковалась никогда: задача известна заранее, запроса нет.
            markBootPhase('tasks-fetched');
            dispatch(eventTaskActions.setFetchedTasks({ tasks }));
            dispatch(eventTaskActions.setCurrentTask({ task: currentTask }));
            dispatch(setCurrentReportContact(currentTask));
        }
    };

/**
 * Загрузка открытых задач обзвона пользователя по владельцу контекста
 * (tasks.task.list; группа задач — портальные настройки поверх
 * domain-config, см. ожидание waitForAppConfig ниже).
 *
 * Привязка выбирается честно по владельцу: компания > сделка > лид.
 * Раньше при отсутствии компании фильтр превращался в `CO_null` и просто
 * ничего не находил — кейс «сделка без компании» был сломан.
 */
/**
 * ТОЧЕЧНОЕ обновление списка событий по текущему контексту приложения.
 *
 * Появился взамен `reloadApp()` в местах «flow отработал → список устарел»
 * (баннер списка и «К списку событий» финиш-экрана). Полный reload ронял
 * `initialized`, размонтировал весь шелл и на секунды оставлял ГОЛЫЙ фон:
 * boot-прелоадер после первого старта уже удалён из DOM, гасить нечего —
 * менеджер видел серый экран без лоадеров, затем жёсткий перемонтаж
 * (todo3108, «подёргивание/серый экран после отправки»). Слепок портала и
 * конфиг при этом перечитывать незачем — устаревают только задачи.
 */
export const refreshEventTasks =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const bitrix = state.app.bitrix;
        await dispatch(
            initialEventTasks(
                [],
                Number(bitrix.user?.ID) || 0,
                Number(bitrix.company?.ID) || null,
                state.app.domain,
                Number(bitrix.lead?.ID) || null,
                Number(bitrix.deal?.ID) || null,
                bitrix.from,
            ),
        );
    };

export const initialEventTasks =
    (
        tasks: Array<BXTask>,
        userId: number,
        companyId: number | null,
        domain: string,
        leadId: number | null,
        dealId: number | null,
        // null допустим: параметр справочный (void from), а во время
        // точечного рефреша встройка может его ещё не знать.
        from: APP_FROM_ENUM | null,
    ) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        void from;
        const ufCrmTasks: string[] = [];
        if (companyId) {
            ufCrmTasks.push(`CO_${companyId}`);
        }
        if (dealId) {
            ufCrmTasks.push(`D_${dealId}`);
        }
        if (leadId) {
            ufCrmTasks.push(`L_${leadId}`);
        }
        if (!ufCrmTasks || !ufCrmTasks.length) {
            // Терминальный исход: грузить нечем — привязки к CRM нет.
            markBootPhase('tasks-fetched');
            markBootPhase('tasks-empty');
            dispatch(eventTaskActions.setFetchedTasks({ tasks: null }));
            return;
        }
        if (!tasks || !tasks.length) {
            // Группа задач читается из состояния ПОСЛЕ портальных настроек
            // (fetchAppConfig стартует листенером на setAppData и к этому
            // моменту обычно ещё летит): без ожидания запрос стабильно уходил
            // с хардкодом domain-config, и настройка группы на портале
            // фактически не работала. Таймаут 1.5с — fail-open на хардкод;
            // ветка TASK/CALL_CARD (задача уже известна) не ждёт вовсе.
            await waitForAppConfig(getState);
            const { taskGroupId } = getState().app.config;
            // Запомним, с чем ушли: настройки портала могут
            // приехать позже и принести другую группу.
            dispatch(
                eventTaskActions.setLoadedWithGroupId({
                    groupId: Number(taskGroupId) || 0,
                }),
            );
            try {
                const response = await Bitrix.getService().task.getList(
                    {
                        GROUP_ID: taskGroupId,
                        UF_CRM_TASK: ufCrmTasks,
                        RESPONSIBLE_ID: userId,
                        '!=STATUS': 5,
                    } as never,
                    EVENT_TASK_SELECT,
                );

                const fetched = response?.result?.tasks as unknown as
                    | BXTask[]
                    | undefined;
                if (fetched) {
                    tasks = fetched;
                }
            } catch (error) {
                // Без этого падение запроса просто роняло thunk: isFetched
                // оставался false, и список крутил скелетон бесконечно.
                console.error('initialEventTasks error', error);
                // Терминальный исход, и самый важный: список кончился
                // ошибкой. Молчание здесь означало бы, что упавший бут не
                // попадает в воронку вовсе — как будто его и не было.
                markBootPhase('tasks-fetched');
                markBootPhase('tasks-error');
                dispatch(
                    eventTaskActions.setTasksError({
                        message: 'Не удалось загрузить события',
                    }),
                );
                return;
            }
        }

        if (tasks && tasks.length) {
            const evntTasks = getEvTasksFromBxTasks(tasks);
            markBootPhase('tasks-fetched');
            dispatch(eventTaskActions.setFetchedTasks({ tasks: evntTasks }));
            // getInitSale(evntTasks) — реакция listener'а на setFetchedTasks (Фаза 4)
        } else {
            // Пустой список — штатная ситуация («дел у менеджера нет»), а не
            // повод молчать: загрузка ДОШЛА до конца, и её время владельцу
            // нужно ровно так же.
            markBootPhase('tasks-fetched');
            markBootPhase('tasks-empty');
            dispatch(eventTaskActions.setFetchedTasks({ tasks: null }));
            // TODO(Фаза 4): нет задач → открыть меню нового события
            // (getResultMenu(EventItemResultType.NEW, null))
        }
    };
