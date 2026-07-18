# Генератор модулей админки

Автоматическая генерация FSD модулей для admin сущностей на основе уже сгенерированных Orval файлов.

## Принцип работы

1. **Парсинг существующих файлов** - читаем `packages/nest-admin-api/src/generated/admin-*-management/`
2. **Дополнение из OpenAPI** - используем `packages/open-api` для получения полной схемы
3. **Генерация модулей** - создаем структуру FSD модулей
4. **Безопасность** - не трогаем существующие конфиги, только читаем и генерируем

## Использование

```bash
# Из корня front/
cd apps/admin
pnpm generate:admin-entities --parse

# Генерация конкретной сущности
pnpm generate:admin-entities --entity=client

# Генерация всех admin сущностей
pnpm generate:admin-entities --all

# Обновление существующего модуля
pnpm generate:admin-entities --update --entity=client
```

## Откат изменений

Просто удалите сгенерированные модули:
```bash
rm -rf apps/admin/modules/entities/{entity-name}
rm -rf apps/admin/app/(entities)/{entity-name}
```

# Проверка (безопасно)
```bash
pnpm generate:admin-entities --entity=client
```
# ⚠️  Модуль "client" уже существует!
# 💡 Используйте: --force или --update

# Обновление (рекомендуется)
```bash
pnpm generate:admin-entities --entity=client --update

```
# 🔄 Обновление существующего модуля...
# Добавит только отсутствующие файлы

# Перезапись (осторожно!)
```bash
pnpm generate:admin-entities --entity=client --force

```
# ⚠️  ВНИМАНИЕ: Модуль будет перезаписан!