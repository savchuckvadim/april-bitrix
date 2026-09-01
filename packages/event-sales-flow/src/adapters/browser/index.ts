/**
 * Фасад браузерных адаптеров портов пакета.
 *
 * ВАЖНО: главный src/index.ts этот фасад НЕ реэкспортирует — фронт
 * импортирует адаптеры лениво отдельным путём
 * (`@workspace/event-sales-flow/src/adapters/browser`), а бэк подключит
 * свои реализации портов; фасад ядра обязан оставаться изоморфным.
 * @workspace/bitrix и @workspace/pbx разрешены ТОЛЬКО здесь
 * (src/adapters/browser/**) — это их законное место.
 */
export * from './console-flow-logger';
export * from './portal-flow-source';
export * from './bitrix-flow-transport';
