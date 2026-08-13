import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { getEntityDescriptor, isLeadOpen } from '@/modules/entities/RelatedCrm';
import { RelatedCrmHelper } from '@/modules/entities/RelatedCrm/lib/api/related-crm-helper';
import { LeadRequestHelper } from '@/modules/features/LeadRequestCard/lib/api/lead-request-helper';
import { presentationLeadLinkActions } from './PresentationLeadLinkSlice';
import type { PresentationLeadCandidate } from './index';

const relatedHelper = new RelatedCrmHelper();
const leadRequestHelper = new LeadRequestHelper();

/** Продолжить отправку после закрытия вопроса (ленивый импорт — цикл). */
const continueSend = async (dispatch: AppDispatch) => {
    const { send } = await import('@/modules/processes/event/model/SendThunk');
    dispatch(send());
};

/**
 * Открыть вопрос «презентация связана с заявкой?» как обязательный шаг
 * перед отправкой: собираем кандидатов (лид контекста + открытые связанные
 * лиды клиента). Кандидатов нет — вопрос закрывается сам и отправка
 * продолжается без модалки.
 */
export const openPresentationLeadLink =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        dispatch(presentationLeadLinkActions.opened({ pendingSend: true }));

        const candidates: PresentationLeadCandidate[] = [];
        const seen = new Set<number>();
        const push = (candidate: PresentationLeadCandidate) => {
            if (seen.has(candidate.id)) return;
            seen.add(candidate.id);
            candidates.push(candidate);
        };

        // Лид контекста встройки/задачи — первый кандидат; его карточка
        // (панель заявки) уже знает isRequest и заголовок.
        const contextLeadId =
            Number(state.app.bitrix.lead?.ID) ||
            Number(state.eventLead.lead?.ID) ||
            null;
        if (contextLeadId && contextLeadId > 0) {
            const panelCard =
                state.leadRequest.card?.leadId === contextLeadId
                    ? state.leadRequest.card
                    : null;
            push({
                id: contextLeadId,
                title:
                    panelCard?.title ??
                    state.app.bitrix.lead?.TITLE ??
                    state.eventLead.lead?.TITLE ??
                    `Лид ${contextLeadId}`,
                isRequest: panelCard?.isRequest ?? false,
                responsibleName: null,
            });
        }

        try {
            const descriptor = getEntityDescriptor({
                from: state.app.bitrix.from,
                company: state.app.bitrix.company,
                deal: state.app.bitrix.deal,
                lead: state.app.bitrix.lead,
            });
            if (descriptor) {
                const details = await relatedHelper.getDetails({
                    domain: state.app.domain,
                    entityType: descriptor.entityType,
                    entityId: descriptor.entityId,
                    includeClosed: false,
                });
                for (const lead of details.leads ?? []) {
                    if (!isLeadOpen(lead.statusSemanticId)) continue;
                    push({
                        id: lead.id,
                        title: lead.title,
                        isRequest: Boolean(lead.questUrl || lead.regNumber),
                        responsibleName: lead.responsible?.name ?? null,
                    });
                }
            }
        } catch (error) {
            console.error('presentation lead link candidates error', error);
            // Кандидаты контекста уже есть — падение related не блокирует.
            if (!candidates.length) {
                dispatch(presentationLeadLinkActions.candidatesFailed());
            }
        }

        if (!candidates.length) {
            // Открытых заявок нет — вопрос неуместен, отправляем сразу.
            dispatch(presentationLeadLinkActions.resolvedAndClosed());
            await continueSend(dispatch);
            return;
        }
        dispatch(presentationLeadLinkActions.candidatesLoaded(candidates));
    };

/** Выбор кандидата: грузим его карточку — варианты статусов для селектов. */
export const selectPresentationLeadCandidate =
    (leadId: number) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        dispatch(presentationLeadLinkActions.candidateSelected(leadId));
        try {
            const card = await leadRequestHelper.getCard(
                getState().app.domain,
                leadId,
            );
            dispatch(presentationLeadLinkActions.cardLoaded(card));
        } catch (error) {
            console.error('presentation lead link card error', error);
            dispatch(presentationLeadLinkActions.cardFailed());
        }
    };

/**
 * Подтверждение выбора. Валидация обязательности статусов — в UI до
 * вызова (кнопка дизейблится). Закрывает вопрос и продолжает отправку.
 */
export const confirmPresentationLeadLink =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const wasPendingSend = getState().presentationLeadLink.pendingSend;
        dispatch(presentationLeadLinkActions.resolvedAndClosed());
        if (wasPendingSend) {
            await continueSend(dispatch);
        }
    };

/** Отмена: менеджер вернулся к форме, отправка не продолжается. */
export const closePresentationLeadLink = () => (dispatch: AppDispatch) => {
    dispatch(presentationLeadLinkActions.closed());
};
