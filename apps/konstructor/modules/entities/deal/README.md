# Deal Entity - Redux Slice и Thunk

Этот модуль предоставляет Redux slice и thunk для управления состоянием сделки с возможностью обновления полей.

## Структура

```
deal/
├── model/
│   ├── DealSlice.ts      # Redux slice для управления состоянием
│   ├── DealThunk.ts      # Async thunks для API вызовов
│   └── index.ts          # Экспорт модели
├── type/
│   ├── deal-field.type.ts # Типы для полей сделки
│   └── index.ts          # Экспорт типов
├── hook/
│   └── useDeal.ts        # Хук для удобной работы с slice
├── lib/
│   ├── service/
│   │   └── deal-update.service.ts # Сервис обновления сделки
│   └── example-usage.tsx # Примеры использования
└── index.ts              # Основной экспорт модуля
```

## Использование

### 1. Инициализация в компоненте

```tsx
import { useDeal } from '@/modules/entities/deal';

const MyComponent = () => {
    const {
        dealData,
        dealId,
        setDeal,
        setDealId,
        updateField,
        updateFieldWithAPI,
    } = useDeal();

    // Установка ID сделки
    useEffect(() => {
        setDealId(123);
    }, []);

    // Установка данных сделки
    useEffect(() => {
        setDeal(dealDataFromAPI);
    }, [dealDataFromAPI]);
};
```

### 2. Обновление полей

```tsx
const DealField = ({ fieldKey, field, dealId }) => {
    const { updateField, updateFieldWithAPI, isUpdating } = useDeal();

    const handleChange = e => {
        const newValue = e.target.value;

        // Обновляем локальное состояние
        updateField(fieldKey, newValue);
    };

    const handleBlur = async () => {
        // Отправляем обновление на сервер
        await updateFieldWithAPI({
            dealId,
            fieldKey,
            value: newValue,
            field,
        });
    };

    return (
        <input
            value={field.value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isUpdating}
        />
    );
};
```

### 3. Состояние

Slice предоставляет следующее состояние:

- `dealData: TDealData | null` - данные сделки
- `dealId: number | null` - ID сделки
- `loading: boolean` - состояние загрузки
- `error: string | null` - ошибка
- `isUpdating: boolean` - состояние обновления

### 4. Actions

- `setDeal(dealData)` - установка данных сделки
- `setDealId(dealId)` - установка ID сделки
- `updateField(fieldKey, value)` - обновление значения поля в состоянии
- `updateFieldWithAPI(payload)` - обновление поля с отправкой на сервер
- `clearDeal()` - очистка данных сделки
- `setError(error)` - установка ошибки
- `clearError()` - очистка ошибки

## Особенности

1. **Двойное обновление**: При изменении поля сначала обновляется локальное состояние, затем при потере фокуса отправляется запрос на сервер
2. **Интеграция с сервисом**: Использует существующий сервис `updateDeal` для обновления полей
3. **Обработка ошибок**: Автоматическая обработка ошибок с помощью `handleSliceError`
4. **Типизация**: Полная типизация с использованием TypeScript

## Пример полного компонента

См. файл `lib/example-usage.tsx` для полного примера использования.
