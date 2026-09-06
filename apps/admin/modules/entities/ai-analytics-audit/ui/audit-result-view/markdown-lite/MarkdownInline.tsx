import { parseMarkdownInline } from '../../../lib/markdown-lite.util';

interface MarkdownInlineProps {
    text: string;
}

/** Строка с инлайн-разметкой: `**жирный**`, `` `код` ``, остальное — текст. */
export const MarkdownInline = ({ text }: MarkdownInlineProps) => (
    <>
        {parseMarkdownInline(text).map((token, index) =>
            token.kind === 'bold' ? (
                <strong key={index} className="font-semibold text-foreground">
                    {token.text}
                </strong>
            ) : token.kind === 'code' ? (
                <code
                    key={index}
                    className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8em]"
                >
                    {token.text}
                </code>
            ) : (
                <span key={index}>{token.text}</span>
            ),
        )}
    </>
);
