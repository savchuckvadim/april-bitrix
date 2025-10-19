'use client';
import { ColorPicker } from '@/modules/shared';
import { Button } from '@workspace/ui/components/button';
import { useState } from 'react';
import { useOfferTemplateKonstructor } from '../../../hook/useOfferTemplateKonstructor';

export const TemplateColorsPicker = () => {
    const { current, setColor } = useOfferTemplateKonstructor();

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col space-y-2 mt-2">
            <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Спрятать' : 'Цвета'}
            </Button>
            <div className={`${isOpen ? 'block' : 'hidden'}`}>
                {current && Object.entries(current?.colors).map(([key, stateColor]) => (
                    <div
                        key={`color-picker-${key}`}
                        className="flex flex-col space-y-2"
                    >
                        <h2 className="text-xl font-bold my-4">
                            {stateColor?.name}
                        </h2>
                        <ColorPicker
                            color={stateColor?.value}
                            onChange={color => setColor(stateColor.code, color)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateColorsPicker;
