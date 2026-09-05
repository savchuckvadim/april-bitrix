/**
 * ПРАВИЛО АНТИ-ДРЕЙФА: правка флоу — СНАЧАЛА бэк
 * (back/apps/event-sales/src/event-report), затем синк пакета и обновление
 * FLOW_SOURCE_COMMIT. Пакет — снятая с ЖИВОГО бэка копия, а не форк:
 * содержательные изменения, родившиеся здесь, — дефект процесса.
 * Проверка расхождений: `pnpm diff:back` (scripts/diff-back.mjs).
 */
export const FLOW_PACKAGE_VERSION = '0.1.0';

/** SHA коммита бэка (`git -C back rev-parse HEAD`), с которого снят код. */
export const FLOW_SOURCE_COMMIT = '8380a8233c00cb952e36e88f6c0e5e5f936318b4';
