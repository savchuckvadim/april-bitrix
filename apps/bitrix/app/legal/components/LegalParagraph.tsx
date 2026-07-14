import React from 'react';

interface LegalParagraphProps {
    text: string;
}

const LIST_ITEM_PREFIX = '— ';

export const LegalParagraph: React.FC<LegalParagraphProps> = ({ text }) => {
    const isListItem = text.startsWith(LIST_ITEM_PREFIX);

    return (
        <p
            className={
                isListItem
                    ? 'text-foreground/90 leading-relaxed pl-6'
                    : 'text-foreground/90 leading-relaxed'
            }
        >
            {text}
        </p>
    );
};
