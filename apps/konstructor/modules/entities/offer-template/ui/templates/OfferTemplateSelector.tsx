import React from 'react';
import { useOfferTemplate } from '../../hook/useOfferTemplate';
import { IOfferTemplate } from '../../type/offer-template.type';

const OfferTemplateSelector: React.FC = () => {
    const { setCurrent, items, current } = useOfferTemplate();
    return (
        <div className="mt-4 mb-2">
            <label className="text-sm font-medium mb-1 block">
                Выберите шаблон
            </label>
            <select
                className="border p-2 rounded w-full"
                value={current?.id}
                onChange={e =>
                    setCurrent(
                        items.find(
                            item => item.id === e.target.value,
                        ) as IOfferTemplate,
                    )
                }
            >
                {items.map(template => (
                    <option
                        key={`template-select-${template.id}`}
                        value={template.id}
                    >
                        {template.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default OfferTemplateSelector;
