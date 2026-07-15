export * from './model';
export * from './model/EventCallingRecordSlice';
export * from './model/EventCallingRecordThunk';
// UI (RecordsList) подключается лениво через next/dynamic (см. EventItem)

/**
 * TODO(Фаза 7+, бэк): транскрибация и AI-резюме записей — эндпоинтов на новом
 * бэке нет (legacy: backAPI transcription + onlineAPI ai) — см. gap-док.
 */
