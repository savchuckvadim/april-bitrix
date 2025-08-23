// import React from 'react'
// import { useOfferTemplateSettings } from '@/modules/feature/offer-pdf-settings';
// import { BlockRenderer } from '../BlockRenderer';
// export const OfferTemplatePriview = () => {

//     const {
//         current
//     } = useOfferTemplateSettings();

//     return (
//         <div>
//             {current.pages.map(page => {
//                 return <div
//                     key={`template-konstructor-preview-page-${page.id}`}
//                     className={'border border-gray-300 rounded h-[297mm] relative my-3'}
//                     style={{
//                         backgroundColor: current.colors.background.value,
//                         color: current.colors.text.value
//                     }}
//                 >
//                     {
//                         page.blocks.map((block, index) => (
//                             <BlockRenderer key={`template-konstructor-preview-block-${page.id}-${index}`} block={block} />
//                         ))
//                     }
//                 </div>
//             }
//             )}

//         </div>
//     )
// }

// export default OfferTemplatePriview;
