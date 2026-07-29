import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group';

export function PriceSettings() {
    return (
        <div className="space-y-2 p-4">
            <h3 className="text-md font-semibold">
                Настройки представления цен
            </h3>
            <RadioGroup
                defaultValue="quantity-sum"
                className="flex flex-col space-y-1"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full-period" id="full-period" />
                    <label
                        htmlFor="full-period"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Показать сумму за весь период обслуживания
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prepayment" id="prepayment" />
                    <label
                        htmlFor="prepayment"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Показать сумму предоплаты
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quantity-sum" id="quantity-sum" />
                    <label
                        htmlFor="quantity-sum"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Показать количество и сумму
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-list" id="price-list" />
                    <label
                        htmlFor="price-list"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Показать цену по прайсу
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="discount" id="discount" />
                    <label
                        htmlFor="discount"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Показать скидку
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remove-od" id="remove-od" />
                    <label
                        htmlFor="remove-od"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Убрать ОД
                    </label>
                </div>
            </RadioGroup>
        </div>
    );
}
