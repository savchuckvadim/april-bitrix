// Hand-maintained barrel of generated tag clients (orval `tags-split` does not
// emit a root index). Add new tag re-exports here as endpoints are wired up on
// the frontend. Schemas are re-exported separately via ./model.

// Bitrix domain
export * from './bitrix-domain-department/bitrix-domain-department';
export * from './bitrix-domain-team/bitrix-domain-team';

// Bitrix marketplace
export * from './bitrix-marketplace-admin/bitrix-marketplace-admin';
export * from './bitrix-marketplace-events/bitrix-marketplace-events';
export * from './bitrix-marketplace-install/bitrix-marketplace-install';
export * from './bitrix-marketplace-router/bitrix-marketplace-router';

// PBX cache (общий кэш данных портала)
export * from './pbx-cache-—-общий-кэш-данных-портала/pbx-cache-—-общий-кэш-данных-портала';

// Telegram
export * from './telegram/telegram';

// Infra
export * from './health/health';
export * from './metrics/metrics';
