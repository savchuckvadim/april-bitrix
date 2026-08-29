// Прямой путь, а не барель слайса каталога: барель тянет транспорт.
import type { QuestionnaireOption } from '@/modules/entities/Questionnaire/model/questionnaire.type';

/**
 * Ответ «да/нет» — ТРЕМЯ состояниями: «не выбрано», «Да», «Нет».
 *
 * Почему не галка: галка по построению двусостоянийна, и её выключенное
 * положение неотличимо от «менеджер не отвечал». В опроснике после
 * презентации это уже стоит граблями — дефолтное «Нет» считается ответом и
 * закрывает вопрос само. Здесь «не выбрано» — пустая строка: она не
 * закрывает обязательный пункт и в портал не уходит (пустоту пишет только
 * явная очистка, см. changeChecklistField).
 *
 * Токены значения свои («Y»/«N»), а не портальные «1»/«0»: значение контрола
 * читают ещё и подписи, и сборка комментария, и им нужен код, а не хранение
 * поля Битрикса. Перевод в портальный формат — одной функцией ниже.
 */

export const CHECKLIST_BOOLEAN_YES = 'Y';
export const CHECKLIST_BOOLEAN_NO = 'N';

/** Варианты контрола; `bitrixId` нет — в поле уходит не элемент, а 1/0. */
export const CHECKLIST_BOOLEAN_OPTIONS: QuestionnaireOption[] = [
    { code: CHECKLIST_BOOLEAN_YES, title: 'Да', bitrixId: null },
    { code: CHECKLIST_BOOLEAN_NO, title: 'Нет', bitrixId: null },
];

/**
 * Значение поля Битрикса → значение контрола.
 *
 * Распознаём ровно известные написания (`1`/`0`, `Y`/`N`, булев тип REST);
 * ВСЁ остальное, включая пустоту и `null`, — «не выбрано». Портал, который
 * ни разу не писал поле, отдаёт пустоту, и трактовать её как «Нет» значило
 * бы приписать менеджеру ответ, которого он не давал.
 *
 * Это ПОДПИСЬ значения, а не ответ на вопрос: «Нет» из поля обязательный
 * пункт не закрывает (ноль в UF-поле неотличим от дефолта — см. readCurrent
 * в `checklist-values.ts`).
 */
export const toChecklistBooleanValue = (raw: unknown): string => {
    if (raw === true) return CHECKLIST_BOOLEAN_YES;
    if (raw === false) return CHECKLIST_BOOLEAN_NO;
    const token = String(raw ?? '')
        .trim()
        .toUpperCase();
    if (token === '1' || token === 'Y' || token === 'TRUE') {
        return CHECKLIST_BOOLEAN_YES;
    }
    if (token === '0' || token === 'N' || token === 'FALSE') {
        return CHECKLIST_BOOLEAN_NO;
    }
    return '';
};

/** Подпись значения («сейчас: Да»); «не выбрано» — пусто. */
export const checklistBooleanTitle = (value: string): string =>
    CHECKLIST_BOOLEAN_OPTIONS.find(option => option.code === value)?.title ??
    '';

/**
 * Значение контрола → значение поля Битрикса: UF-поле типа `boolean`
 * хранит 1/0. Нераспознанное — `null`: «писать нечего», запись отменяется
 * (чужое значение не трогаем), как и у справочника без bitrixId.
 */
export const toPortalBooleanValue = (value: string): string | null => {
    if (value === CHECKLIST_BOOLEAN_YES) return '1';
    if (value === CHECKLIST_BOOLEAN_NO) return '0';
    return null;
};
