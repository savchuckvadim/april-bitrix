'use server';

const RenderFormattedText: React.FC<{
    text: string;
    textColor: string;
    redColor: string;
    titleColor: string;
    font: string;
}> = ({ text, textColor, redColor, titleColor, font }) => {
    const parseText = (text: string) => {
        const result: React.ReactNode[] = [];
        const parts = text.split(/(<[^>]+>|<\/[^>]+>)/);

        let currentTag: string | null = null;

        parts.forEach((part, index) => {
            if (!part) return;

            if (part.startsWith('<') && !part.startsWith('</')) {
                // Открывающий тег
                currentTag = part.replace(/<|>/g, '');
            } else if (part.startsWith('</')) {
                // Закрывающий тег
                currentTag = null;
            } else if (currentTag === 'bold') {
                result.push(
                    <strong
                        key={index}
                        style={{ color: textColor }}
                        className={`text-${titleColor} font-bold`}
                    >
                        {part}
                    </strong>,
                );
            } else if (currentTag === 'color') {
                result.push(
                    <span
                        key={index}
                        style={{ color: titleColor }}
                        className=" font-bold"
                    >
                        {part}
                    </span>,
                );
            } else if (currentTag === 'red') {
                result.push(
                    <span
                        key={index}
                        style={{ color: redColor }}
                        className=" font-bold"
                    >
                        {part}
                    </span>,
                );
            } else {
                result.push(
                    <span key={index} style={{ color: textColor }}>
                        {part}
                    </span>,
                );
            }
        });

        return result;
    };

    return (
        <div>
            {text.split('\\n').map((line, i) => (
                <p key={i} className={`mb-0 ${font}`}>
                    {parseText(line)}
                </p>
            ))}
        </div>
    );
};
export default RenderFormattedText;
