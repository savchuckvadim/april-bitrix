import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import type { PlatformFaqItem } from '../model/types';

export interface FaqListProps {
    items: readonly PlatformFaqItem[];
}

/** Возражения и ответы: раскрываются по одному, чтобы не стенкой текста. */
export function FaqList({ items }: FaqListProps) {
    return (
        <Accordion type="single" collapsible className="max-w-3xl">
            {items.map(item => (
                <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger className="text-left text-base font-semibold">
                        {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-pretty text-base text-muted-foreground">
                        {item.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
