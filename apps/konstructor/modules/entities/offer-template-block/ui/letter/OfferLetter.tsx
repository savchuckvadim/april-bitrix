import { FC, useEffect, useRef } from 'react';
import { IOfferBlockLetter } from '../../type/offer-template-block.type';
import FormattedText from './FormattedText';

import { useOfferTemplateBlock } from '../../hook/useOfferTemplateBlock';
import { useOfferTemplateKonstructor } from '@/modules/entities/offer-template-konstructor/hook/useOfferTemplateKonstructor';

const pxToMm = (px: number) => px / 3.779528;

const OfferLetter: FC<{ block: IOfferBlockLetter; inOffer: boolean }> = ({
    block,
    inOffer,
}) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const { editBlockHieght, colors } = useOfferTemplateKonstructor();
    const { changeLetter } = useOfferTemplateBlock();
    console.log(block.height, 'block.height');
    const backgroundColor = colors?.background?.value;

    useEffect(() => {
        if (!inOffer && block.id) {
            if (contentRef.current) {
                const pxHeight = contentRef.current.scrollHeight;
                const mmHeight = pxToMm(pxHeight);
                const roundedHeight = Math.ceil(mmHeight * 100) / 100; // округляем до сотых
                if (Math.abs(roundedHeight - block.height) > 0.1) {
                    editBlockHieght(block.id, roundedHeight);
                    changeLetter(block.content.text, roundedHeight);
                }
            }
        }
    }, [block.content.text]);

    return (
        <div
            className={`flex my-2 p-3`}
            style={{
                backgroundColor: backgroundColor,
                height: `${block.height}mm`,
            }}
        >
            <div ref={contentRef} className="w-full">
                <FormattedText text={block.content.text} />
            </div>
        </div>
    );
};

export default OfferLetter;
