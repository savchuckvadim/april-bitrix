import { Badge } from '@workspace/ui/components/badge';

const VARIANTS = ['default', 'secondary', 'outline'] as const;

export const Tag = ({ tag, variantIndex }: { tag: string; variantIndex: number }) => {
    const v = VARIANTS[variantIndex % VARIANTS.length];
    return (
        <Badge variant={v} className="mb-1 mr-1 px-2 py-0.5 text-[11px] font-normal">
            #{tag}
        </Badge>
    );
};
