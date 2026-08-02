'use client';

import type { FC, ReactNode } from 'react';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import {
    SIM_FAIL_REASONS,
    SIM_FAIL_TYPES,
    SIM_NORESULT_REASONS,
} from '../../constants/sim-events';
import { SimContactPicker } from './SimContactPicker';
import { SimPresentationFork } from './SimPresentationFork';

interface SimReportZoneProps {
    result: 'result' | 'noresult';
    onResultChange: (value: 'result' | 'noresult') => void;
    noresultReason: string;
    onNoresultReasonChange: (code: string) => void;
    workStatus: string;
    onWorkStatusChange: (code: string) => void;
    isFail: boolean;
    /** Работа отложена автоматически — из-за далёкого срока плана. */
    isSetAside: boolean;
    /** Что показываем в ряду статусов при текущем состоянии. */
    workStatusItems: { code: string; label: string; isPickable: boolean }[];
    failType: string;
    onFailTypeChange: (code: string) => void;
    failReason: string;
    onFailReasonChange: (code: string) => void;
    isResult: boolean;
    /** Отчитываемся по презентации — тогда развилка своя. */
    isPresentationReport: boolean;
    presentationHeld: boolean;
    onPresentationHeldChange: (value: boolean) => void;
    unplannedPresentation: boolean;
    onUnplannedPresentationChange: (value: boolean) => void;
    comment: string;
    onCommentChange: (value: string) => void;
    contactId: string | null;
    onContactChange: (id: string) => void;
    errors: Record<string, string>;
    showErrors: boolean;
}

const Field: FC<{ title: string; children: ReactNode }> = ({
    title,
    children,
}) => (
    <div>
        <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
            {title}
        </p>
        <div className="mt-2">{children}</div>
    </div>
);

/**
 * Левая зона формы — «Отчёт» о том, что уже произошло.
 *
 * Тип отказа и возражение спрашиваются только при отказе, но спрашиваются
 * обязательно: без них не собрать разбор причин, ради которого отчётность
 * вообще ведётся. Раньше симулятор писал, что они обязательны, но не показывал
 * их — то есть обещал то, чего не делал.
 */
export const SimReportZone: FC<SimReportZoneProps> = ({
    result,
    onResultChange,
    noresultReason,
    onNoresultReasonChange,
    workStatus,
    onWorkStatusChange,
    isFail,
    isSetAside,
    workStatusItems,
    failType,
    onFailTypeChange,
    failReason,
    onFailReasonChange,
    isResult,
    isPresentationReport,
    presentationHeld,
    onPresentationHeldChange,
    unplannedPresentation,
    onUnplannedPresentationChange,
    comment,
    onCommentChange,
    contactId,
    onContactChange,
    errors,
    showErrors,
}) => (
    <div className="space-y-4">
        <Field title="Как прошло">
            <div className="flex flex-wrap gap-2">
                {(
                    [
                        ['result', 'Результативно'],
                        ['noresult', 'Нерезультативно'],
                    ] as const
                ).map(([code, label]) => (
                    <button
                        key={code}
                        type="button"
                        onClick={() => onResultChange(code)}
                        aria-pressed={result === code}
                        className={cn(
                            'focus-visible:outline-primary cursor-pointer rounded-lg border-2 px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2',
                            result === code
                                ? code === 'result'
                                    ? 'border-success bg-success/10 text-success'
                                    : 'border-warning bg-warning/10 text-warning'
                                : 'text-muted-foreground hover:border-primary/50',
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </Field>

        {!isResult && (
            <Field title="Почему не получилось">
                <Select
                    value={noresultReason}
                    onValueChange={onNoresultReasonChange}
                >
                    <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SIM_NORESULT_REASONS.map(reason => (
                            <SelectItem
                                key={reason.code}
                                value={reason.code}
                                className="cursor-pointer"
                            >
                                {reason.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-muted-foreground mt-1 text-[11px]">
                    Нерезультативный звонок — не провал, а доказательство
                    работы. Он попадает в KPI с причиной.
                </p>
            </Field>
        )}

        <Field title="Что теперь с клиентом">
            <div className="flex flex-wrap gap-1.5">
                {workStatusItems.map(status => {
                    // «Отложено» показываем активным, но нажать нельзя: оно
                    // следствие срока, а не выбор.
                    const isActive =
                        status.code === 'setAside'
                            ? isSetAside
                            : workStatus === status.code;

                    return (
                        <button
                            key={status.code}
                            type="button"
                            disabled={!status.isPickable}
                            onClick={() => onWorkStatusChange(status.code)}
                            aria-pressed={isActive}
                            title={
                                status.isPickable
                                    ? undefined
                                    : 'Ставится само по сроку следующего события'
                            }
                            className={cn(
                                'focus-visible:outline-primary rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2',
                                status.isPickable
                                    ? 'cursor-pointer'
                                    : 'cursor-not-allowed',
                                isActive
                                    ? status.code === 'fail'
                                        ? 'border-destructive bg-destructive/10 text-destructive font-semibold'
                                        : status.code === 'success'
                                          ? 'border-success bg-success/10 text-success font-semibold'
                                          : status.code === 'setAside'
                                            ? 'border-warning bg-warning/10 text-warning font-semibold'
                                            : 'border-primary bg-primary/10 text-primary font-semibold'
                                    : 'text-muted-foreground hover:border-primary',
                            )}
                        >
                            {status.label}
                            {status.code === 'setAside' && ' · само'}
                        </button>
                    );
                })}
            </div>
            {workStatus === 'success' && (
                <p className="text-success mt-1.5 text-[11px]">
                    Продажу отправляют отсюда, а не перетаскиванием карточки в
                    воронке.
                </p>
            )}

            {isSetAside && (
                <p className="border-warning/50 bg-warning/10 text-warning mt-2 rounded-lg border px-3 py-2 text-[11px] leading-relaxed">
                    <span className="font-bold">Работа отложена. </span>
                    Этот статус не выбирают — он встал сам, потому что следующее
                    событие назначено дальше чем на четыре месяца. Приблизите
                    срок — вернётся «В работе».
                </p>
            )}
        </Field>

        {isFail && (
            <div className="border-destructive/40 bg-destructive/5 grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                <div>
                    <Label
                        htmlFor="fail-type"
                        className="text-xs font-semibold"
                    >
                        Тип отказа
                    </Label>
                    <Select value={failType} onValueChange={onFailTypeChange}>
                        <SelectTrigger
                            id="fail-type"
                            className="mt-1.5 w-full cursor-pointer"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SIM_FAIL_TYPES.map(item => (
                                <SelectItem
                                    key={item.code}
                                    value={item.code}
                                    className="cursor-pointer"
                                >
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {showErrors && errors.failType && (
                        <p className="text-destructive mt-1 text-[11px]">
                            {errors.failType}
                        </p>
                    )}
                </div>

                <div>
                    <Label
                        htmlFor="fail-reason"
                        className="text-xs font-semibold"
                    >
                        Возражение
                    </Label>
                    <Select
                        value={failReason}
                        onValueChange={onFailReasonChange}
                    >
                        <SelectTrigger
                            id="fail-reason"
                            className="mt-1.5 w-full cursor-pointer"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SIM_FAIL_REASONS.map(item => (
                                <SelectItem
                                    key={item.code}
                                    value={item.code}
                                    className="cursor-pointer"
                                >
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {showErrors && errors.failReason && (
                        <p className="text-destructive mt-1 text-[11px]">
                            {errors.failReason}
                        </p>
                    )}
                </div>

                <p className="text-muted-foreground text-[11px] sm:col-span-2">
                    Без этих двух полей отказ не собрать в разбор причин — а
                    именно он показывает, где отдел теряет деньги.
                </p>
            </div>
        )}

        {isPresentationReport ? (
            <SimPresentationFork
                isResult={isResult}
                held={presentationHeld}
                onHeldChange={onPresentationHeldChange}
            />
        ) : (
            isResult && (
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="checkbox"
                        checked={unplannedPresentation}
                        onChange={event =>
                            onUnplannedPresentationChange(event.target.checked)
                        }
                        className="accent-primary size-4 cursor-pointer"
                    />
                    <span className="text-xs">
                        Провёл презентацию, хотя планировал другое
                    </span>
                </label>
            )
        )}

        <Field title="Комментарий">
            <Textarea
                value={comment}
                onChange={event => onCommentChange(event.target.value)}
                rows={6}
                placeholder="О чём договорились, что сказал клиент, что мешает"
            />
            <p className="text-muted-foreground mt-1 text-[11px]">
                Одно поле — шесть адресатов: заголовочный комментарий новой
                задачи, запись KPI, история работы, карточка компании, список
                презентаций и разбор отказов.
            </p>
            {showErrors && errors.comment && (
                <p className="text-destructive mt-1 text-[11px]">
                    {errors.comment}
                </p>
            )}
        </Field>

        <SimContactPicker
            id="report-contact"
            label="С кем общались"
            hint="Контакт отчёта. Он не обязан совпадать с тем, кого выбрали в плане."
            value={contactId}
            onChange={onContactChange}
        />
    </div>
);
