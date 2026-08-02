import type { FC } from 'react';
import { ArrowRight } from 'lucide-react';
import { renderInline } from '../../lib/render-inline';

interface TheoryBenefitProps {
    feature: string;
    meaning: string;
    gain: string;
}

/**
 * Связка «свойство → что это значит → что даёт».
 *
 * Три такта, а не один: перечисление возможностей ничего не говорит человеку,
 * который ещё не понял, зачем ему этот документ. Между свойством и выгодой
 * всегда стоит объяснение — без него выгода звучит как обещание.
 */
export const TheoryBenefit: FC<TheoryBenefitProps> = ({
    feature,
    meaning,
    gain,
}) => (
    <div className="bg-card rounded-xl border p-4">
        <p className="text-foreground font-semibold">{renderInline(feature)}</p>

        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            {renderInline(meaning)}
        </p>

        <p className="text-success mt-2 flex gap-2 text-sm leading-relaxed">
            <ArrowRight className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{renderInline(gain)}</span>
        </p>
    </div>
);
