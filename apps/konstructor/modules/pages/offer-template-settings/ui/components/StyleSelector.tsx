// import React from 'react';
// import { STYLE_PRESETS } from '@/app/lib/offer-style/styles';

// interface Props {
//   selectedId: string;
//   onChange: (id: string) => void;
// }

// export const StyleSelector: React.FC<Props> = ({ selectedId, onChange }) => {
//   return (
//     <div className="my-4">
//       <h2 className="text-lg font-semibold mb-2">Выберите стиль оформления</h2>
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//         {STYLE_PRESETS.map((preset) => (
//           <button
//             key={preset.id}
//             onClick={() => onChange(preset.id)}
//             className={`p-4 border rounded-md text-left transition hover:shadow-sm ${
//               selectedId === preset.id
//                 ? 'border-blue-500 ring-2 ring-blue-300'
//                 : 'border-gray-300'
//             }`}
//             style={{ backgroundColor: preset.backgroundColor, fontFamily: preset.fontFamily }}
//           >
//             <div
//               className="text-xl font-bold mb-1"
//               style={{ color: preset.headingColor }}
//             >
//               {preset.name}
//             </div>
//             <div
//               className="text-sm"
//               style={{ color: preset.textColor }}
//             >
//               {preset.fontFamily}
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };
