'use client';

import { RefreshCw } from 'lucide-react';
import { Spinner } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { useContractSpecification } from '../hooks/use-contract-specification';

/** Спецификация договора (Приложение): строки с бэка, менеджер правит открытые. */
export const ContractSpecificationCard = () => {
    const spec = useContractSpecification();

    return (
        <SectionCard
            title="Спецификация"
            description="Приложение к договору: наполнение, поставка, сроки. Серые строки собирает бэк."
            tone="complect"
            actions={
                <Button variant="ghost" size="sm" onClick={spec.reload} disabled={spec.isLoading}>
                    <RefreshCw className="h-4 w-4" />
                    Пересобрать
                </Button>
            }
            state={spec.error ? 'error' : undefined}
            message={spec.error}
        >
            {spec.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size="sm" />
                    Собираю спецификацию…
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {spec.sums.length ? (
                        <dl className="grid grid-cols-3 gap-2 text-sm">
                            {spec.sums.map(sum => (
                                <div key={sum.code} className="flex flex-col">
                                    <dt className="text-xs text-muted-foreground">{sum.label}</dt>
                                    <dd className="font-medium tabular-nums">{sum.value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : null}
                    {spec.items.map(item => {
                        const id = `spec-${item.code}`;
                        const value = typeof item.value === 'string' ? item.value : '';
                        return (
                            <div key={item.code} className="flex flex-col gap-1">
                                <Label htmlFor={id}>
                                    {item.name}
                                    {item.isRequired ? <span className="text-destructive"> *</span> : null}
                                </Label>
                                {item.type === 'text' ? (
                                    <Textarea
                                        id={id}
                                        value={value}
                                        disabled={item.isDisable}
                                        rows={Math.min(6, Math.max(2, value.split('\n').length))}
                                        onChange={event => spec.setValue(item.code, event.target.value)}
                                    />
                                ) : (
                                    <Input
                                        id={id}
                                        value={value}
                                        disabled={item.isDisable}
                                        onChange={event => spec.setValue(item.code, event.target.value)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </SectionCard>
    );
};
