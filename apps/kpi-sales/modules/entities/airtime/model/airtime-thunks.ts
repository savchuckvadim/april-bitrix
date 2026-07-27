import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { BXUserDto } from '@workspace/nest-kpi-report-sales-api';
import { AirtimeHelper } from '../lib/api/airtime-helper';
import { airtimeActions } from './airtime-slice';

const airtimeHelper = new AirtimeHelper();

const buildRequestKey = (
    from: string,
    to: string,
    users: BXUserDto[],
): string =>
    `${from}|${to}|${users
        .map(user => Number(user.ID))
        .sort((a, b) => a - b)
        .join('_')}`;

const toBxUserDto = (user: {
    ID?: string | number;
    NAME?: string;
    LAST_NAME?: string;
}): BXUserDto => ({
    ID: String(user.ID ?? ''),
    NAME: user.NAME ?? '',
    LAST_NAME: user.LAST_NAME ?? '',
});

/** Эфирное время команды (текущий фильтр сотрудников + даты отчёта). */
export const getTeamAirtime =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { from, to } = state.report.date;
        const users = state.department.current.map(toBxUserDto);
        // Пустой domain — публичная страница /share: данные сидятся снимком.
        if (!state.app.domain || !from || !to || !users.length) return;

        const requestKey = buildRequestKey(from, to, users);
        const { status, requestKey: loadedKey } = state.airtime.team;
        if (loadedKey === requestKey && status !== 'error') return;

        dispatch(airtimeActions.teamPending({ requestKey }));
        try {
            const report = await airtimeHelper.getStatistic({
                domain: state.app.domain,
                filters: { departament: users, dateFrom: from, dateTo: to },
            });
            dispatch(airtimeActions.teamReady(report));
        } catch (error) {
            dispatch(
                airtimeActions.teamFailed(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось получить эфирное время',
                ),
            );
        }
    };

/** Эфирное время одного сотрудника (карточка в user report). */
export const getUserAirtime =
    (userId: number) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { from, to } = state.report.date;
        const bxUser = state.department.items.find(
            item => Number(item?.ID) === userId,
        );
        if (!state.app.domain || !from || !to || !bxUser) return;

        const users = [toBxUserDto(bxUser)];
        const requestKey = buildRequestKey(from, to, users);
        const { status, requestKey: loadedKey } = state.airtime.user;
        if (loadedKey === requestKey && status !== 'error') return;

        dispatch(airtimeActions.userPending({ requestKey, userId }));
        try {
            const report = await airtimeHelper.getStatistic({
                domain: state.app.domain,
                filters: { departament: users, dateFrom: from, dateTo: to },
            });
            dispatch(airtimeActions.userReady(report));
        } catch (error) {
            dispatch(
                airtimeActions.userFailed(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось получить эфирное время',
                ),
            );
        }
    };
