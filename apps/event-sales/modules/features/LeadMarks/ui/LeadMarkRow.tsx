'use client';

import { FC } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { GradientScale, MicroSpinner, ToneBadge } from '@workspace/april-ui';
import { findPortalField } from '@workspace/pbx';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    LEAD_NOT_CA_ITEM_CODE,
    LEAD_NOT_CA_TYPE_CODE,
    LEAD_SITE_STATUS_CODE,
    isLeadMarkComplete,
    type LeadMark,
} from '../lib/lead-marks-view';
import { saveLeadMark } from '../model/LeadMarksThunk';

interface LeadMarkRowProps {
    mark: LeadMark;
    /** Сделка, с которой прошла продажа — для пометки «участвовал». */
    saleDealId: number | null;
}

/** Рампа статуса заявки: от «появилась» к «в работе», отказ — красным. */
const REQUEST_RAMP = ['var(--muted-foreground)', 'var(--warning)', 'var(--success)'];

/**
 * Строка лида/заявки: название, статус заявки шкалой (клик по делению —
 * выбор), тип «не ЦА» когда он обязателен, и пометка участия в продаже
 * (to_sale_deal). Всё редактируется на месте — модалка продажи и вкладка
 * «Лиды/Заявки» показывают одни и те же строки.
 */
export const LeadMarkRow: FC<LeadMarkRowProps> = ({ mark, saleDealId }) => {
    const dispatch = useAppDispatch();
    const portal = useAppSelector(s => s.portal.portal);
    const isSaving = useAppSelector(s =>
        s.leadMarks.savingIds.includes(mark.id),
    );

    const fields = portal?.lead?.bitrixfields;
    const siteStatus = findPortalField(fields, LEAD_SITE_STATUS_CODE);
    const notCaType = findPortalField(fields, LEAD_NOT_CA_TYPE_CODE);

    const statusItems = siteStatus?.items ?? [];
    const statusIndex = statusItems.findIndex(
        item => item.code === mark.siteStatusCode,
    );
    const isNotCa = mark.siteStatusCode === LEAD_NOT_CA_ITEM_CODE;
    const isSale = saleDealId !== null && mark.saleDealId === saleDealId;

    return (
        <div className="flex min-w-0 flex-col gap-1 rounded-md border border-border px-2 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">
                    {mark.title}
                </span>
                {isSaving && <MicroSpinner size={12} />}
                {!isLeadMarkComplete(mark) && (
                    <ToneBadge tone="warning" variant="soft" size="sm">
                        не заполнено
                    </ToneBadge>
                )}
                {saleDealId !== null && (
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                            dispatch(
                                saveLeadMark(mark.id, {
                                    saleDealId: isSale ? null : saleDealId,
                                }),
                            )
                        }
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                        {isSale ? (
                            <CheckCircle2
                                aria-hidden
                                className="size-3.5 text-success"
                            />
                        ) : (
                            <Circle aria-hidden className="size-3.5" />
                        )}
                        в продаже
                    </button>
                )}
            </div>

            {statusItems.length > 0 && (
                <GradientScale
                    labels={statusItems.map(item => item.name)}
                    currentIndex={statusIndex}
                    ramp={REQUEST_RAMP}
                    onSelect={index =>
                        dispatch(
                            saveLeadMark(mark.id, {
                                siteStatusCode: statusItems[index]?.code ?? null,
                            }),
                        )
                    }
                    title="Статус заявки"
                    currentWord="сейчас"
                    ariaLabel={`Статус заявки: ${
                        statusItems[statusIndex]?.name ?? 'не задан'
                    }`}
                />
            )}

            {isNotCa && notCaType?.items?.length ? (
                <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[0.6875rem] text-muted-foreground">
                        Причина:
                    </span>
                    {notCaType.items.map(item => (
                        <button
                            key={item.code}
                            type="button"
                            disabled={isSaving}
                            onClick={() =>
                                dispatch(
                                    saveLeadMark(mark.id, {
                                        notCaTypeCode: item.code,
                                    }),
                                )
                            }
                            className="cursor-pointer"
                        >
                            <ToneBadge
                                tone={
                                    mark.notCaTypeCode === item.code
                                        ? 'destructive'
                                        : 'muted'
                                }
                                variant="soft"
                                size="sm"
                            >
                                {item.name}
                            </ToneBadge>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
