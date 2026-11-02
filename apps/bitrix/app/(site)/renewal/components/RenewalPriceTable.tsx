import React from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import type {
    RenewalPriceRow,
    RenewalPriceTableData,
} from '../model/renewal-offer.rows';

export interface RenewalPriceTableProps {
    readonly table: RenewalPriceTableData;
}

/** Отступы ячеек одни на всю таблицу: цены стоят одним столбцом до итога. */
const CELL_X = 'px-4 sm:px-6';
const CELL = `${CELL_X} py-4 align-top`;
const PRICE = 'whitespace-nowrap text-right tabular-nums';

const PriceRows: React.FC<{ rows: readonly RenewalPriceRow[] }> = ({ rows }) => (
    <>
        {rows.map((row) => (
            <tr key={row.title} className="border-t border-border first:border-t-0">
                <th scope="row" className={`${CELL} text-left font-normal`}>
                    <div className="font-medium text-foreground">{row.title}</div>
                    {row.note ? (
                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                            {row.note}
                        </p>
                    ) : null}
                </th>
                <td
                    className={`${CELL} ${PRICE} ${
                        row.included
                            ? 'text-muted-foreground'
                            : 'font-medium text-foreground'
                    }`}
                >
                    {row.price}
                </td>
            </tr>
        ))}
    </>
);

/**
 * Смета предложения: услуги, цены столбцом, итог.
 *
 * Итог отчёркнут двойной линией, как в бухгалтерских документах, и набран
 * в том же столбце, что и цены: глаз идёт по суммам сверху вниз и приходит
 * к платежу. Разовые услуги стоят уже после итога, потому что в ежемесячный
 * платёж не входят.
 */
export const RenewalPriceTable: React.FC<RenewalPriceTableProps> = ({
    table,
}) => {
    const { monthly, once, servicesTotal, discount, surcharge } = table;

    return (
        <SectionCard
            surface="solid"
            className="gap-0 overflow-hidden py-0"
            contentClassName="space-y-0 px-0"
        >
            <table className="w-full border-collapse text-base">
                <caption className="sr-only">
                    Стоимость услуг на следующий год и ежемесячный платёж
                </caption>
                <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                        <th scope="col" className={`${CELL_X} py-3 text-left font-normal`}>
                            Услуга
                        </th>
                        <th scope="col" className={`${CELL_X} py-3 text-right font-normal`}>
                            В месяц
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <PriceRows rows={monthly} />
                </tbody>
                <tfoot>
                    {servicesTotal ? (
                        <tr className="border-t border-border text-muted-foreground">
                            <th scope="row" className={`${CELL_X} pt-4 pb-1 text-left font-normal`}>
                                Стоимость услуг
                            </th>
                            <td className={`${CELL_X} pt-4 pb-1 ${PRICE}`}>
                                {servicesTotal}
                            </td>
                        </tr>
                    ) : null}
                    {discount ? (
                        <tr className="text-success">
                            <th scope="row" className={`${CELL_X} pt-1 pb-4 text-left font-medium`}>
                                {discount.label} {discount.percent}%
                            </th>
                            <td className={`${CELL_X} pt-1 pb-4 font-medium ${PRICE}`}>
                                {discount.value}
                            </td>
                        </tr>
                    ) : null}
                    {surcharge ? (
                        <tr className="text-muted-foreground">
                            <th scope="row" className={`${CELL_X} pt-1 pb-4 text-left font-normal`}>
                                {surcharge.label}
                            </th>
                            <td className={`${CELL_X} pt-1 pb-4 ${PRICE}`}>
                                +{surcharge.value}
                            </td>
                        </tr>
                    ) : null}
                    <tr className="border-t-4 border-double border-foreground/50">
                        <th scope="row" className={`${CELL_X} py-5 text-left align-bottom font-normal sm:py-6`}>
                            <div className="text-lg font-semibold text-foreground">
                                Итого в месяц
                            </div>
                            <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Стоимость зафиксирована на 12 месяцев с момента
                                продления
                            </p>
                        </th>
                        <td
                            className={`${CELL_X} py-5 align-bottom text-3xl font-semibold tracking-tight text-foreground sm:py-6 sm:text-5xl ${PRICE}`}
                        >
                            {table.monthlyTotal}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {once.length > 0 ? (
                <table className="w-full border-collapse border-t border-border bg-muted/30 text-base">
                    <caption className="sr-only">
                        Разовые услуги, в ежемесячный платёж не входят
                    </caption>
                    <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                            <th scope="col" className={`${CELL_X} py-3 text-left font-normal`}>
                                Разовые услуги — оплачиваются отдельно
                            </th>
                            <th scope="col" className={`${CELL_X} py-3 text-right font-normal`}>
                                Один раз
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <PriceRows rows={once} />
                    </tbody>
                    {once.length > 1 && table.onceTotal ? (
                        <tfoot>
                            <tr className="border-t border-border">
                                <th scope="row" className={`${CELL} text-left font-medium text-foreground`}>
                                    Итого разово
                                </th>
                                <td className={`${CELL} font-medium text-foreground ${PRICE}`}>
                                    {table.onceTotal}
                                </td>
                            </tr>
                        </tfoot>
                    ) : null}
                </table>
            ) : null}
        </SectionCard>
    );
};
