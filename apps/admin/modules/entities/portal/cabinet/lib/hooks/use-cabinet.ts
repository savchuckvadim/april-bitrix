'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { CabinetHelper } from '../api/cabinet-helper';
import type {
    CabinetAddMember,
    CabinetInviteResult,
    CabinetNewClient,
    CabinetPasswordLink,
} from '../../model';

const helper = new CabinetHelper();
const KEY = ['portal-cabinet'] as const;

/** Кабинет портала: организация, участники, привязки Telegram. */
export const useCabinetCard = (portalId?: number) =>
    useQuery({
        queryKey: [...KEY, portalId],
        queryFn: () => helper.card(portalId as number),
        enabled: !!portalId,
    });

/** Общая обвязка действий: тост, ошибка по-русски, перечитать кабинет. */
const useCabinetAction = <TVars, TResult>(
    portalId: number,
    action: (vars: TVars) => Promise<TResult>,
    successText: string,
    onDone?: (result: TResult) => void,
) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: action,
        onSuccess: result => {
            toast.success(successText);
            onDone?.(result);
            void qc.invalidateQueries({ queryKey: [...KEY, portalId] });
        },
        onError: error =>
            toast.error('Не получилось', {
                description: getApiErrorMessage(error),
            }),
    });
};

export const useAttachCabinetClient = (portalId: number) =>
    useCabinetAction(
        portalId,
        (clientId: number | null) => helper.attachClient(portalId, clientId),
        'Организация сохранена',
    );

/** Списки и сводки клиентов, которые меняются вместе с организацией портала. */
const CLIENT_KEYS: ReadonlyArray<readonly string[]> = [['clients'], ['client-overview']];

/** «Создать организацию» на вкладке «Кабинет»: заводит и сразу привязывает. */
export const useCreateCabinetClient = (portalId: number) => {
    const qc = useQueryClient();
    return useCabinetAction(
        portalId,
        (payload: CabinetNewClient) => helper.createClient(portalId, payload),
        'Организация создана и привязана',
        () => CLIENT_KEYS.forEach(queryKey => void qc.invalidateQueries({ queryKey })),
    );
};

/** Привязать портал к организации со страницы клиента. */
export const useAttachPortalToClient = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { portalId: number; clientId: number }) =>
            helper.attachClient(vars.portalId, vars.clientId),
        onSuccess: (_card, vars) => {
            toast.success('Портал привязан');
            void qc.invalidateQueries({ queryKey: [...KEY, vars.portalId] });
            void qc.invalidateQueries({ queryKey: ['portals'] });
            CLIENT_KEYS.forEach(queryKey => void qc.invalidateQueries({ queryKey }));
        },
        onError: error =>
            toast.error('Не получилось', { description: getApiErrorMessage(error) }),
    });
};

export const useInviteCabinetMember = (
    portalId: number,
    onDone: (result: CabinetInviteResult) => void,
) =>
    useCabinetAction(
        portalId,
        (payload: CabinetAddMember) => helper.invite(portalId, payload),
        'Доступ выдан',
        onDone,
    );

export const useApproveCabinetMember = (portalId: number) =>
    useCabinetAction(
        portalId,
        (membershipId: string) => helper.approve(portalId, membershipId),
        'Заявка подтверждена',
    );

export const useMakeCabinetOwner = (portalId: number) =>
    useCabinetAction(
        portalId,
        (membershipId: string) => helper.makeOwner(portalId, membershipId),
        'Права владельца переданы',
    );

export const useCabinetPasswordLink = (
    portalId: number,
    onDone: (link: CabinetPasswordLink) => void,
) =>
    useCabinetAction(
        portalId,
        (membershipId: string) => helper.passwordLink(portalId, membershipId),
        'Ссылка выпущена',
        onDone,
    );

export const useRevokeCabinetMember = (portalId: number) =>
    useCabinetAction(
        portalId,
        (membershipId: string) => helper.revoke(portalId, membershipId),
        'Доступ снят',
    );

/** Разбор ответа pbx: «поставлено 4, снято 1». */
const widgetsSummary = (details?: string): string => {
    try {
        const parsed = JSON.parse(details ?? '{}') as {
            bound?: number;
            unbound?: number;
            errors?: number;
            total?: number;
        };
        if (!parsed.total) return 'Список виджетов портала пуст — привязки не трогали';
        return `Поставлено: ${parsed.bound ?? 0}, снято: ${parsed.unbound ?? 0}, ошибок: ${parsed.errors ?? 0}`;
    } catch {
        return details ?? '';
    }
};

export const useRefreshCabinetWidgets = (portalId: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (force: boolean) => helper.refreshWidgets(portalId, force),
        onSuccess: (result, force) => {
            toast.success(force ? 'Виджеты переустановлены' : 'Виджеты обновлены', {
                description: widgetsSummary(result.details),
            });
            void qc.invalidateQueries({ queryKey: [...KEY, portalId] });
        },
        onError: error =>
            toast.error('Виджеты не обновились', {
                description: getApiErrorMessage(error),
            }),
    });
};

export const useRevokeCabinetTelegram = (portalId: number) =>
    useCabinetAction(
        portalId,
        (bindingId: string) => helper.revokeTelegram(portalId, bindingId),
        'Telegram отвязан',
    );
