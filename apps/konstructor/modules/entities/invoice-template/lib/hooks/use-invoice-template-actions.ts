'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type {
    InvoiceTemplate,
    InvoiceTemplateCreateInput,
    InvoiceTemplateUpdateInput,
} from '../../model';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';
import { requestErrorText } from '../invoice-template-list.util';
import { saveBlobAsFile, templateFileName } from '../save-template-file.util';

const helper = new InvoiceTemplateHelper();

/** Тексты результата действия: успех (или тишина) и заголовок ошибки. */
interface ActionMessages {
    ok: string | null;
    fail: string;
}

/**
 * Действия над шаблонами счетов. Каждое возвращает `true` по факту ответа
 * сервера, успех и ошибка показываются тостом. После изменения список
 * загружается заново через `onChanged`.
 */
export const useInvoiceTemplateActions = (onChanged: () => Promise<void>) => {
    // строка, над которой идёт действие; форма создания и правки считается отдельно
    const [busyId, setBusyId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const run = useCallback(
        async (
            work: () => Promise<unknown>,
            messages: ActionMessages,
            reload: boolean,
        ): Promise<boolean> => {
            try {
                await work();
                if (reload) await onChanged();
                if (messages.ok) toast.success(messages.ok);
                return true;
            } catch (failure) {
                toast.error(messages.fail, {
                    description: requestErrorText(failure, 'Ошибка сервера'),
                });
                return false;
            }
        },
        [onChanged],
    );

    const onRow = useCallback(
        async (
            template: InvoiceTemplate,
            work: () => Promise<unknown>,
            messages: ActionMessages,
            reload = true,
        ): Promise<boolean> => {
            setBusyId(template.id);
            try {
                return await run(work, messages, reload);
            } finally {
                setBusyId(null);
            }
        },
        [run],
    );

    const onForm = useCallback(
        async (
            work: () => Promise<unknown>,
            messages: ActionMessages,
        ): Promise<boolean> => {
            setIsSaving(true);
            try {
                return await run(work, messages, true);
            } finally {
                setIsSaving(false);
            }
        },
        [run],
    );

    return {
        busyId,
        isSaving,
        create: (input: InvoiceTemplateCreateInput) =>
            onForm(() => helper.create(input), {
                ok: `Шаблон «${input.name}» добавлен`,
                fail: 'Не удалось добавить шаблон',
            }),
        update: (id: string, input: InvoiceTemplateUpdateInput) =>
            onForm(() => helper.update(id, input), {
                ok: `Шаблон «${input.name}» сохранён`,
                fail: 'Не удалось сохранить шаблон',
            }),
        setActive: (template: InvoiceTemplate, isActive: boolean) =>
            onRow(template, () => helper.setActive(template.id, isActive), {
                ok: isActive ? 'Шаблон включён' : 'Шаблон выключен',
                fail: 'Не удалось переключить шаблон',
            }),
        setDefault: (template: InvoiceTemplate, isDefault: boolean) =>
            onRow(template, () => helper.setDefault(template.id, isDefault), {
                ok: isDefault
                    ? 'Шаблон назначен по умолчанию'
                    : 'Шаблон больше не по умолчанию',
                fail: 'Не удалось назначить шаблон по умолчанию',
            }),
        archive: (template: InvoiceTemplate) =>
            onRow(template, () => helper.archive(template.id), {
                ok: 'Шаблон перенесён в архив',
                fail: 'Не удалось перенести шаблон в архив',
            }),
        unarchive: (template: InvoiceTemplate) =>
            onRow(template, () => helper.unarchive(template.id), {
                ok: 'Шаблон возвращён из архива',
                fail: 'Не удалось вернуть шаблон из архива',
            }),
        remove: (template: InvoiceTemplate) =>
            onRow(template, () => helper.remove(template.id), {
                ok: 'Шаблон удалён',
                fail: 'Не удалось удалить шаблон',
            }),
        download: (template: InvoiceTemplate) =>
            onRow(
                template,
                async () =>
                    saveBlobAsFile(
                        await helper.download(template.id),
                        templateFileName(template.name),
                    ),
                { ok: null, fail: 'Не удалось скачать шаблон' },
                false,
            ),
    };
};
