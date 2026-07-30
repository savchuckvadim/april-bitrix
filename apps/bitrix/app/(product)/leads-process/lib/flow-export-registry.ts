/** Живой канвас-редактор, умеющий отдать PNG своего состояния. */
export interface FlowExportEntry {
    flowId: string;
    /** Название оригинальной схемы */
    title: string;
    /** Актуальная подпись клиента к варианту */
    getCaption: () => string;
    /** Снимок канваса в PNG (dataURL) */
    exportPng: () => Promise<string>;
}

const registry = new Map<string, FlowExportEntry>();

/** Регистрирует смонтированный редактор; возвращает отписку. */
export const registerFlowExport = (entry: FlowExportEntry): (() => void) => {
    registry.set(entry.flowId, entry);
    return () => {
        if (registry.get(entry.flowId) === entry) {
            registry.delete(entry.flowId);
        }
    };
};

/** Все живые редакторы на странице. */
export const listFlowExports = (): FlowExportEntry[] => [...registry.values()];
