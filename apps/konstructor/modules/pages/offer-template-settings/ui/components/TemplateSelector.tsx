// import { useOfferTemplateSettings } from '@/modules/feature/offer-pdf-settings';
// import { OfferPdfSetting } from '@/modules/feature/offer-pdf-settings/model/OfferPdfSettingsSlice';
// import React from 'react';

// const TemplateSelector: React.FC = () => {
//     const { setCurrent, items, current } = useOfferTemplateSettings()
//     return <div className="mt-4 mb-2">
//         <label className="text-sm font-medium mb-1 block">Выберите шаблон</label>
//         <select
//             className="border p-2 rounded w-full"
//             value={current.id}
//             onChange={(e) => setCurrent(items.find(item => item.id === e.target.value) as OfferPdfSetting)}
//         >
//             {items.map((template) => (
//                 <option key={`template-select-${template.id}`} value={template.id}>
//                     {template.name}
//                 </option>
//             ))}
//         </select>
//     </div>
// };

// export default TemplateSelector;
