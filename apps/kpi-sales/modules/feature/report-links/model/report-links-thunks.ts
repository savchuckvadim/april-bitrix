import type { ShareLinkDto } from '@workspace/nest-kpi-report-sales-api';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { logClient } from '@/modules/app/lib/helper/logClient';
import { ShareLinkHelper } from '../lib/api/share-link-helper';
import { buildShareFilterSnapshot } from '../lib/build-snapshot.util';
import { reportLinksActions } from './report-links-slice';

const shareLinkHelper = new ShareLinkHelper();

/** Максимальный срок жизни ссылки, дней (зеркалит бэк). */
export const SHARE_LINK_MAX_LIFETIME_DAYS = 14;

/** Максимальный период фильтра обновляемой ссылки, дней (зеркалит бэк). */
export const SHARE_LINK_MAX_REFRESHABLE_RANGE_DAYS = 31;

/** Лимит активных ссылок на пользователя (зеркалит бэк SHARE_LINK_MAX_ACTIVE_PER_CREATOR). */
export const SHARE_LINK_MAX_ACTIVE = 20;

/** Публичный URL ссылки — страница /share/[token] этого же приложения. */
export const buildShareUrl = (token: string): string =>
    typeof window === 'undefined'
        ? `/share/${token}`
        : `${window.location.origin}/share/${token}`;

const errorMessage = (error: unknown): string =>
    error instanceof Error && error.message
        ? error.message
        : 'Что-то пошло не так';

export const fetchShareLinks =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const { app, reportLinks } = getState();
        if (!app.domain || reportLinks.isLoading) return;

        dispatch(reportLinksActions.setLoading(true));
        try {
            // Только СВОИ ссылки (созданные текущим пользователем).
            const creatorBxUserId = Number(app.bitrix.user?.ID) || undefined;
            const links = await shareLinkHelper.list({
                domain: app.domain,
                creatorBxUserId,
            });
            dispatch(reportLinksActions.setLinks(links));
        } catch (error) {
            dispatch(reportLinksActions.setLinks([]));
            logClient(
                {
                    title: 'share links',
                    level: 'error',
                    context: 'fetchShareLinks',
                    message: 'Не удалось загрузить список ссылок',
                    domain: app.domain,
                    userId: app.bitrix.user?.ID ?? '',
                },
                { error: errorMessage(error) },
            );
        }
    };

export interface CreateShareLinkOptions {
    title?: string;
    expiresInDays: number;
    isRefreshable: boolean;
}

/**
 * Создание публичной ссылки: снимок текущего фильтра + выбранные опции.
 * Бэк синхронно генерит первый снимок данных — ожидание как у загрузки
 * отчёта. Успех кладёт createdToken (UI показывает «скопировать URL»).
 */
export const createShareLink =
    (options: CreateShareLinkOptions) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { app, reportLinks } = state;
        const user = app.bitrix.user;
        if (!user || reportLinks.isCreating) return;

        dispatch(reportLinksActions.setCreating(true));
        try {
            const link = await shareLinkHelper.create({
                domain: app.domain,
                creatorBxUserId: Number(user.ID),
                creatorName:
                    `${user.NAME ?? ''} ${user.LAST_NAME ?? ''}`.trim() ||
                    String(user.ID),
                title: options.title,
                expiresInDays: options.expiresInDays,
                isRefreshable: options.isRefreshable,
                snapshot: buildShareFilterSnapshot(state),
            });
            dispatch(reportLinksActions.linkCreated(link));

            try {
                await navigator.clipboard.writeText(buildShareUrl(link.token));
            } catch {
                // буфер обмена недоступен (не https/нет фокуса) — не критично
            }
        } catch (error) {
            dispatch(reportLinksActions.setError(errorMessage(error)));
            logClient(
                {
                    title: 'share links',
                    level: 'error',
                    context: 'createShareLink',
                    message: 'Не удалось создать ссылку',
                    domain: app.domain,
                    userId: user.ID,
                },
                { error: errorMessage(error), options },
            );
        }
    };

const mutate =
    (
        token: string,
        action: (domain: string, token: string) => Promise<ShareLinkDto>,
        context: string,
    ) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const { app, reportLinks } = getState();
        if (!app.domain || reportLinks.mutatingToken) return;

        dispatch(reportLinksActions.setMutatingToken(token));
        try {
            const link = await action(app.domain, token);
            dispatch(reportLinksActions.linkUpdated(link));
        } catch (error) {
            dispatch(reportLinksActions.setError(errorMessage(error)));
            logClient(
                {
                    title: 'share links',
                    level: 'error',
                    context,
                    message: 'Не удалось изменить ссылку',
                    domain: app.domain,
                    userId: app.bitrix.user?.ID ?? '',
                },
                { error: errorMessage(error), token },
            );
        }
    };

export const revokeShareLink = (token: string) =>
    mutate(
        token,
        (domain, t) => shareLinkHelper.revoke({ domain, token: t }),
        'revokeShareLink',
    );

export const refreshShareLink = (token: string) =>
    mutate(
        token,
        (domain, t) => shareLinkHelper.refresh({ domain, token: t }),
        'refreshShareLink',
    );

export const toggleShareLinkRefreshable = (link: ShareLinkDto) =>
    mutate(
        link.token,
        (domain, t) =>
            shareLinkHelper.update({
                domain,
                token: t,
                isRefreshable: !link.isRefreshable,
            }),
        'toggleShareLinkRefreshable',
    );
