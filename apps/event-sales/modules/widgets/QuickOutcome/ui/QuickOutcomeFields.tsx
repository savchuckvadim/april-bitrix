'use client';

import { FC } from 'react';
import { MicroField, MicroSelect } from '@workspace/april-ui';
import { Input } from '@workspace/ui/components/input';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    EventReportSelectProp,
    eventReportActions,
} from '@/modules/entities/EventReport';
import { eventSaleActions } from '@/modules/entities/EventSale';
import { getPresentationCategoryId } from '@/modules/entities/EventSale/lib/presentation-deals';
import { eventPostFailActions } from '@/modules/entities/EVPostFail';
import { usePresentationDeals } from '@/modules/widgets/EventItem/lib/hooks/use-presentation-deals';

/** Селекты одинаковой ширины: выбор длинной причины не раздвигает строку. */
const SELECT_STABLE = 'w-44 *:data-[slot=select-value]:min-w-0';

/**
 * Поля окна «Отказ»: тип, причина и (где включено) дата следующего звонка.
 * Те же значения, что в форме дела, — слайсы общие.
 */
export const QuickOutcomeFailFields: FC = () => {
    const dispatch = useAppDispatch();
    const report = useAppSelector(s => s.eventReport.report);
    const withPostFail = useAppSelector(s => s.app.config.withPostFail);
    const postFailDate = useAppSelector(s => s.eventPostFail.postFailDate);

    const failType = report[EV_REPORT_PROP.FAIL_TYPE];
    const failReason = report[EV_REPORT_PROP.FAIL_REASON];
    const setProp = (propName: EventReportSelectProp) => (value: string) =>
        dispatch(eventReportActions.setReportProp({ propName, value }));

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {failType.isActive && (
                <MicroField label="Тип отказа" required>
                    <MicroSelect
                        ariaLabel="Тип отказа"
                        value={String(failType.current.id)}
                        options={failType.items.map(item => ({
                            value: String(item.id),
                            label: item.name,
                        }))}
                        onChange={setProp(EV_REPORT_PROP.FAIL_TYPE)}
                        className={SELECT_STABLE}
                    />
                </MicroField>
            )}
            {failReason.isActive && (
                <MicroField label="Причина отказа" required>
                    <MicroSelect
                        ariaLabel="Причина отказа"
                        value={String(failReason.current.id)}
                        options={failReason.items.map(item => ({
                            value: String(item.id),
                            label: item.name,
                        }))}
                        onChange={setProp(EV_REPORT_PROP.FAIL_REASON)}
                        className={SELECT_STABLE}
                    />
                </MicroField>
            )}
            {withPostFail && (
                <MicroField label="Следующий звонок" required>
                    <Input
                        type="date"
                        value={postFailDate}
                        onChange={e => {
                            dispatch(
                                eventPostFailActions.setPostFailDate({
                                    date: e.target.value,
                                }),
                            );
                            dispatch(
                                eventPostFailActions.setIsChanged({
                                    status: true,
                                }),
                            );
                        }}
                        className="h-6 w-34 px-2 py-0 text-[0.6875rem]"
                    />
                </MicroField>
            )}
        </div>
    );
};

/**
 * Поле окна «Продажа»: связь с презентационной сделкой клиента.
 *
 * Список подгружается по факту открытия окна. Связывать не с чем, если у
 * портала нет воронки презентаций, — тогда запрос не уходит вовсе, и строка
 * «ищем…» висела бы вечно; поэтому поле в этом случае не рисуется.
 */
export const QuickOutcomeSaleFields: FC = () => {
    const dispatch = useAppDispatch();
    const canLink = useAppSelector(
        s =>
            Boolean(Number(s.app.bitrix.company?.ID)) &&
            getPresentationCategoryId(s.portal.portal?.bitrixDeal?.categories) !==
                null,
    );
    const presDeals = usePresentationDeals(canLink);

    if (!canLink) return null;

    if (!presDeals.items.length) {
        return (
            <p className="text-xs text-muted-foreground">
                {presDeals.isItemsFetched
                    ? 'Презентаций у клиента нет — связывать продажу не с чем.'
                    : 'Ищем презентации клиента…'}
            </p>
        );
    }

    return (
        <MicroField label="Сделка презентации">
            <MicroSelect
                ariaLabel="Сделка презентации"
                value={
                    presDeals.current ? String(presDeals.current.ID) : undefined
                }
                placeholder="Связать со сделкой"
                options={presDeals.items.map(deal => ({
                    value: String(deal.ID),
                    label: deal.TITLE,
                }))}
                onChange={value =>
                    dispatch(
                        eventSaleActions.setCurrentPresItem({
                            dealId: Number(value),
                            type: 'current',
                        }),
                    )
                }
                className={SELECT_STABLE}
            />
        </MicroField>
    );
};
