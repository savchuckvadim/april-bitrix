interface AboutTextBlockProps {
    title: string;
    text: string;
}

/** Подзаголовок + абзац самоописания (правило, хранение, доступ). */
export const AboutTextBlock = ({ title, text }: AboutTextBlockProps) => (
    <div className="space-y-1.5">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{text}</p>
    </div>
);
