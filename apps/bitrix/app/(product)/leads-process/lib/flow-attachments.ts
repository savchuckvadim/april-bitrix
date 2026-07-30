import { HowProtocolAttachment } from '../../how-we-work/constants/types';
import { listFlowExports } from './flow-export-registry';
import { variantFileName } from './flow-export';

/**
 * Собирает PNG всех вариантов схем, нарисованных клиентом на странице, —
 * приложения к протоколу листа решений.
 */
export const collectFlowAttachments = async (): Promise<
    HowProtocolAttachment[]
> => {
    const entries = listFlowExports();
    const attachments: HowProtocolAttachment[] = [];

    for (const entry of entries) {
        try {
            const dataUrl = await entry.exportPng();
            attachments.push({
                fileName: variantFileName(entry.flowId),
                caption:
                    entry.getCaption().trim() ||
                    `Вариант клиента — «${entry.title}»`,
                dataUrl,
            });
        } catch {
            // пустой/сломанный канвас пропускаем — протокол важнее
        }
    }

    return attachments;
};
