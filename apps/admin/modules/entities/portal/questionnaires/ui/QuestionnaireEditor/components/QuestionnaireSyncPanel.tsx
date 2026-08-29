'use client';

import { Button } from '@workspace/ui/components/button';
import { Download, Loader2 } from 'lucide-react';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type {
    QuestionnaireFieldSyncReport,
    QuestionnaireSyncItem,
} from '../../../lib/field-sync-view';
import { QuestionnaireSyncItemRow } from './QuestionnaireSyncItemRow';

interface QuestionnaireSyncPanelProps {
    report: QuestionnaireFieldSyncReport;
    /** Почему подтянуть нельзя; `null` — можно. */
    blockReason: string | null;
    isApplying: boolean;
    onApplyAll: () => void;
    onApplyItem: (item: QuestionnaireSyncItem) => void;
    onTogglePick: (pickKey: string, isPicked: boolean) => void;
    onHide: () => void;
}

/**
 * Что в Битриксе разошлось с анкетой.
 *
 * Панель появляется сама после сверки при открытии — владелец спрашивал
 * ровно об этом: название поля или элементы списка меняют в Битриксе, и
 * анкета должна показывать актуальное. Но подтягивает изменения ОН, а не
 * мы: формулировка вопроса и подписи вариантов — авторские, и переписать
 * их живым текстом Битрикса молча значило бы каждый раз стирать его
 * работу. Отмечает он их построчно: новый вариант списка забирается без
 * того, чтобы отдать формулировку вопроса. Адрес записи (`bitrixId`
 * варианта, гашение исчезнувшего) сверка правит сама — в этом списке его
 * нет.
 */
export const QuestionnaireSyncPanel = ({
    report,
    blockReason,
    isApplying,
    onApplyAll,
    onApplyItem,
    onTogglePick,
    onHide,
}: QuestionnaireSyncPanelProps) => (
    <section className="space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl space-y-1">
                <h2 className="text-sm font-semibold">
                    {QUESTIONNAIRE_EDITOR_TEXT.syncTitle}
                </h2>
                <p className="text-sm">{report.headline}</p>
                <p className="text-xs text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.syncHint}
                </p>
                {/* Поля читались урезанным способом — разбор неполон, и
                    молчать об этом нельзя: «расхождений нет» здесь значило
                    бы «мы их не видели». */}
                {report.degradedReason && (
                    <p className="text-xs text-muted-foreground">
                        {report.degradedReason}
                    </p>
                )}
                {/* Почему подпись поля видна почти всегда. */}
                <p className="text-xs text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.syncTitleNote}
                </p>
                {/* Сколько уедет по кнопке — чтобы «Подтянуть отмеченное»
                    не приходилось проверять глазами по всем вопросам. */}
                <p className="text-xs text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.syncPicked}: {report.pickedCount}{' '}
                    / {report.applicableCount}
                </p>
                {blockReason && (
                    <p className="text-xs text-destructive">{blockReason}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!report.payload || !!blockReason || isApplying}
                    title={blockReason ?? undefined}
                    onClick={onApplyAll}
                >
                    {isApplying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {isApplying
                        ? QUESTIONNAIRE_EDITOR_TEXT.syncApplying
                        : QUESTIONNAIRE_EDITOR_TEXT.syncApplyAll}
                </Button>
                <Button variant="ghost" size="sm" onClick={onHide}>
                    {QUESTIONNAIRE_EDITOR_TEXT.syncClose}
                </Button>
            </div>
        </div>

        <ul className="space-y-2">
            {report.items.map(item => (
                <QuestionnaireSyncItemRow
                    key={item.itemId}
                    item={item}
                    blockReason={blockReason}
                    isApplying={isApplying}
                    onApply={onApplyItem}
                    onTogglePick={onTogglePick}
                />
            ))}
        </ul>
    </section>
);
