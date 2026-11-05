'use client';

export interface SpecificationSumsProps {
    sums: Array<{ code: string; label: string; value: string }>;
}

/** Суммы общей формы договора — справка над строками спецификации. */
export const SpecificationSums = ({ sums }: SpecificationSumsProps) =>
    sums.length ? (
        <dl className="grid grid-cols-3 gap-2 text-sm">
            {sums.map(sum => (
                <div key={sum.code} className="flex flex-col">
                    <dt className="text-xs text-muted-foreground">{sum.label}</dt>
                    <dd className="font-medium tabular-nums">{sum.value}</dd>
                </div>
            ))}
        </dl>
    ) : null;
