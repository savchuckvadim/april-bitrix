# BX-RQ Package - Redux Toolkit Integration

Этот пакет содержит Redux Toolkit slice и thunk для управления состоянием BX-RQ (Bitrix Request Queue).

## Структура

- `src/model/bx-rq-slice.ts` - RTK slice с actions и reducers
- `src/model/bx-rq-thunk.ts` - Thunk функции для асинхронных операций
- `src/model/bx-rq-thunk-types.ts` - Типы для интеграции с основным приложением

## Интеграция с основным приложением

### 1. Добавление slice в store

В основном приложении добавьте reducer в store:

```typescript
// store.ts
import { bxrqSlice } from '@workspace/bx-rq';

const rootReducer = combineReducers({
    app: appReducer,
    bxrq: bxrqSlice.reducer, // Добавьте эту строку
    // ... другие reducers
});
```

### 2. Обновление типов

Замените типы в `packages/bx-rq/src/model/bx-rq-thunk-types.ts` на реальные типы из вашего store:

```typescript
// Замените на реальные импорты из вашего store
import { AppDispatch, RootState } from '@/modules/app/model/store';

export type AppThunkDispatch = AppDispatch;
export type AppThunkGetState = () => RootState;
```

### 3. Использование в компонентах

```typescript
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
  fetchBXRQ,
  saveBXRQ,
  setBasePropThunk
} from '@workspace/bx-rq';
import {
  selectBXRQState,
  selectBXRQLoading
} from '@workspace/bx-rq';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const bxrqState = useAppSelector(selectBXRQState);
  const isLoading = useAppSelector(selectBXRQLoading);

  const handleFetch = () => {
    dispatch(fetchBXRQ('domain', 123));
  };

  const handleSave = () => {
    dispatch(saveBXRQ(RQ_TYPE.ORGANIZATION, CONTRACT_LTYPE.SUPPLY, SupplyTypesType.GOODS));
  };

  const handlePropChange = (code: string, value: string) => {
    dispatch(setBasePropThunk(code, value));
  };

  return (
    <div>
      {/* Ваш UI */}
    </div>
  );
};
```

## Основные функции

### Thunk функции

- `fetchBXRQ(domain, companyId)` - Загрузка данных BX-RQ
- `saveBXRQ(clientType, contractType, supplyType)` - Сохранение базовых данных
- `saveAddress(clientType, typeId)` - Сохранение адреса
- `saveBank(bankId)` - Сохранение банковских данных
- `setBasePropThunk(code, value)` - Установка свойства базовых данных
- `blurCase(code, value)` - Обработка blur события

### Selectors

- `selectBXRQState` - Полное состояние
- `selectBXRQData` - Данные RQ
- `selectBXRQLoading` - Статус загрузки
- `selectBXRQError` - Ошибки
- `selectBXRQCurrentItem` - Текущий элемент
- `selectBXRQCurrentItems` - Текущие элементы
- `selectBXRQCreatingBase` - Создание базовых данных
- `selectBXRQCreatingAddress` - Создание адреса
- `selectBXRQCreatingBank` - Создание банковских данных

## Преимущества RTK

1. **Типобезопасность** - Все actions и state типизированы
2. **Иммутабельность** - Автоматическое обновление state
3. **DevTools** - Встроенная поддержка Redux DevTools
4. **Производительность** - Оптимизированные обновления
5. **Читаемость** - Более чистый и понятный код

## Миграция с классического Redux

Если вы мигрируете с классического Redux:

1. Замените `dispatch(actionCreator())` на `dispatch(action())`
2. Обновите типы в компонентах
3. Используйте selectors вместо прямого доступа к state
4. Обновите middleware если необходимо
