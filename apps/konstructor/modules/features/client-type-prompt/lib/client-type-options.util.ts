export interface ClientTypeOption {
    /** Код значения `op_client_type` на портале. */
    code: string;
    label: string;
}

/**
 * Варианты окна в порядке показа. Коды стабильны на всех порталах (bitrixId у
 * каждого свой), подписи заданы здесь: на портале они могут называться иначе.
 */
const CLIENT_TYPE_OPTIONS: readonly ClientTypeOption[] = [
    { code: 'commerc', label: 'Коммерческие' },
    { code: 'state', label: 'Бюджетники' },
    { code: 'ip', label: 'ИП' },
    { code: 'fiz', label: 'Физ. лицо' },
    { code: 'layer', label: 'Адвокаты' },
];

/**
 * Варианты по пунктам поля портала: показываются только те, что на портале
 * есть. Пункты с неизвестным кодом пропускаются: типа клиента они не дают.
 */
export const buildClientTypeOptions = (
    items: ReadonlyArray<{ code: string }> | null | undefined,
): ClientTypeOption[] =>
    CLIENT_TYPE_OPTIONS.filter(option =>
        items?.some(item => item.code === option.code),
    );
