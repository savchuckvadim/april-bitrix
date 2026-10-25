'use client';

import { RefreshCw } from 'lucide-react';
import { Spinner } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { useSupplyForm } from '../hooks/use-supply-form';
import { SupplyFieldInput } from './SupplyFieldInput';

/** Форма отчёта о поставке (легаси DocumentSupplyCard): 15 полей для отдела сервиса. */
export const SupplyReportFieldsCard = () => {
    const form = useSupplyForm();

    return (
        <SectionCard
            title="Поставка"
            description="Что передаём в отдел сервиса: продажа, договор, счёт, ситуация у клиента."
            tone="complect"
            actions={
                <Button variant="ghost" size="sm" onClick={form.reload} disabled={form.isLoading}>
                    <RefreshCw className="h-4 w-4" />
                    Обновить состав
                </Button>
            }
            state={form.error ? 'error' : undefined}
            message={form.error}
        >
            {form.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size="sm" />
                    Загружаю форму…
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {form.items.map(item => (
                        <SupplyFieldInput
                            key={item.code}
                            item={item}
                            file={form.files[item.code]}
                            onText={value => form.setText(item.code, value)}
                            onSelect={optionCode => form.setSelect(item, optionCode)}
                            onFile={file => form.pickFile(item.code, file)}
                        />
                    ))}
                </div>
            )}
        </SectionCard>
    );
};
