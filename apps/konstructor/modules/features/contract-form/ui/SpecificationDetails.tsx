'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import { isLtSection, type SpecificationSection } from '../lib/specification-sections.util';
import { SpecificationField } from './SpecificationField';
import { SpecificationLtPackets } from './SpecificationLtPackets';

export interface SpecificationDetailsProps {
    sections: SpecificationSection[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (code: string, value: string) => void;
}

/**
 * Состав комплекта в спецификации (легаси «Развернуть»): инфоблоки,
 * энциклопедии решений, Legal Tech, консалтинг, поставка — по разделам.
 */
export const SpecificationDetails = ({ sections, open, onOpenChange, onChange }: SpecificationDetailsProps) =>
    sections.length ? (
        <Collapsible open={open} onOpenChange={onOpenChange} className="flex flex-col gap-3">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="self-start">
                    <ChevronDown className={open ? 'h-4 w-4 rotate-180 transition-transform' : 'h-4 w-4 transition-transform'} />
                    {open ? 'Свернуть состав' : 'Состав комплекта: инфоблоки, энциклопедии решений, Legal Tech'}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-4">
                {sections.map(section => (
                    <section key={section.key} className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">{section.title}</h4>
                        {isLtSection(section.key) ? (
                            <SpecificationLtPackets items={section.items} />
                        ) : (
                            section.items.map(item => (
                                <SpecificationField key={item.code} item={item} onChange={onChange} />
                            ))
                        )}
                    </section>
                ))}
            </CollapsibleContent>
        </Collapsible>
    ) : null;
