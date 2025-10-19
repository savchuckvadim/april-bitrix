'use server';
import { FC } from 'react';
import { IOfferBlockLetter } from '../../../type/offer-template-block.type';
import RenderFormattedText from './RenderFormattedText';
import { OfferTemplateDto } from '@workspace/nest-api';

const RenderOfferLetter: FC<{
    block: IOfferBlockLetter;
    template: OfferTemplateDto;
}> = ({ block, template }) => {
    const colors = template.colors;
    const backgroundColor = colors?.background?.value as string;

    return (
        <div
            className={`flex my-2 p-3`}
            style={{
                backgroundColor: backgroundColor as string,
                height: `${block.height}mm`,
            }}
        >
            <div className="w-full" >
                <RenderFormattedText
                    text={block.content.text}
                    textColor={colors?.text?.value as string}
                    redColor={colors?.accentText?.value as string}
                    titleColor={colors?.accent?.value as string}
                    font={template.fonts[0]?.name || ''}
                />
            </div>
        </div>
    );
};

export default RenderOfferLetter;
