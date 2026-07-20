import React from 'react';
import { linkifyLegalText } from './linkify';

interface LegalParagraphProps {
    text: string;
}

const LIST_ITEM_PREFIX = '— ';

export const LegalParagraph: React.FC<LegalParagraphProps> = ({ text }) => {
    const isListItem = text.startsWith(LIST_ITEM_PREFIX);
    const chunks = linkifyLegalText(text);

    return (
        <p
            className={
                isListItem
                    ? 'text-foreground/90 leading-relaxed pl-6'
                    : 'text-foreground/90 leading-relaxed'
            }
        >
            {chunks.map((chunk, index) =>
                chunk.kind === 'link' ? (
                    <a
                        key={index}
                        href={chunk.href}
                        target={
                            chunk.href.startsWith('http') ? '_blank' : undefined
                        }
                        rel={
                            chunk.href.startsWith('http')
                                ? 'noopener noreferrer'
                                : undefined
                        }
                        className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity break-words"
                    >
                        {chunk.value}
                    </a>
                ) : (
                    <React.Fragment key={index}>{chunk.value}</React.Fragment>
                ),
            )}
        </p>
    );
};
